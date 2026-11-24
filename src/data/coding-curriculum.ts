export interface SandboxRunResult {
  outputs: string[];
  error: string | null;
  stepsExecuted: number;
  variables: Record<string, number | string>;
}

const MAX_STEPS = 500;
const FORBIDDEN_PATTERNS =
  /\b(window|document|eval|Function|fetch|XMLHttpRequest|import|require|localStorage|globalThis)\b/i;

function evaluateSafeExpression(
  expr: string,
  vars: Record<string, number | string>,
): number | string {
  const trimmed = expr.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  // Support simple string concatenation with + when quotes exist
  if (trimmed.includes('"') || trimmed.includes("'")) {
    return trimmed
      .split("+")
      .map((part) => {
        const p = part.trim();
        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
          return p.slice(1, -1);
        }
        return p in vars ? String(vars[p]) : p;
      })
      .join("");
  }

  // Safe arithmetic parser (+, -, *, /, %, parentheses) without eval
  const tokens = trimmed
    .replace(/\s+/g, "")
    .match(/[A-Za-z_][A-Za-z0-9_]*|\d+(\.\d+)?|[()+\-*/%]/g);
  if (!tokens) throw new Error(`Invalid expression: ${expr}`);

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const parseFactor = (): number => {
    const tok = peek();
    if (!tok) throw new Error("Unexpected end of expression");
    if (tok === "(") {
      consume();
      const val = parseExpr();
      if (peek() !== ")") throw new Error("Missing closing parenthesis");
      consume();
      return val;
    }
    if (tok === "-") {
      consume();
      return -parseFactor();
    }
    consume();
    if (/^\d+(\.\d+)?$/.test(tok)) return Number(tok);
    if (tok in vars) {
      const v = Number(vars[tok]);
      if (Number.isFinite(v)) return v;
    }
    throw new Error(`Unknown numeric identifier: ${tok}`);
  };

  const parseTerm = (): number => {
    let left = parseFactor();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = consume();
      const right = parseFactor();
      if (op === "*") left *= right;
      else if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        left /= right;
      } else {
        if (right === 0) throw new Error("Modulo by zero");
        left %= right;
      }
    }
    return left;
  };

  const parseExpr = (): number => {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return Number(left.toFixed(4));
  };

  const result = parseExpr();
  if (pos < tokens.length) throw new Error(`Unexpected token: ${tokens[pos]}`);
  return result;
}

function evaluateCondition(cond: string, vars: Record<string, number | string>): boolean {
  const m = cond.trim().match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!m) throw new Error(`Invalid condition: ${cond}`);
  const left = Number(evaluateSafeExpression(m[1]!, vars));
  const op = m[2]!;
  const right = Number(evaluateSafeExpression(m[3]!, vars));
  switch (op) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    default:
      return false;
  }
}

/**
 * Pure safe educational mini-language interpreter.
 * Zero eval(), zero Function(), zero DOM/network access, and strict MAX_STEPS=500 guard.
 */
export function runSafeEducationalCode(source: string): SandboxRunResult {
  if (FORBIDDEN_PATTERNS.test(source)) {
    return {
      outputs: [],
      error: "Security sandbox blocked restricted browser/system identifier.",
      stepsExecuted: 0,
      variables: {},
    };
  }

  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"));

  const vars: Record<string, number | string> = {};
  const outputs: string[] = [];
  let steps = 0;

  const execBlock = (blockLines: string[]) => {
    let i = 0;
    while (i < blockLines.length) {
      steps++;
      if (steps > MAX_STEPS) {
        throw new Error(`Execution stopped: exceeded safe ${MAX_STEPS}-step loop guard.`);
      }
      const line = blockLines[i]!;

      const repeatMatch = line.match(/^repeat\s+(\d+)\s*\{$/i);
      if (repeatMatch) {
        const count = Math.min(Number(repeatMatch[1]), 100);
        const inner: string[] = [];
        let depth = 1;
        i++;
        while (i < blockLines.length && depth > 0) {
          const cur = blockLines[i]!;
          if (cur.endsWith("{")) depth++;
          if (cur === "}") {
            depth--;
            if (depth === 0) break;
          }
          inner.push(cur);
          i++;
        }
        if (depth !== 0) throw new Error("Unclosed repeat block '{ ... }'");
        for (let r = 0; r < count; r++) {
          vars["step"] = r + 1;
          execBlock(inner);
        }
        i++;
        continue;
      }

      const ifMatch = line.match(/^if\s*\((.+)\)\s*\{$/i);
      if (ifMatch) {
        const cond = ifMatch[1]!;
        const inner: string[] = [];
        let depth = 1;
        i++;
        while (i < blockLines.length && depth > 0) {
          const cur = blockLines[i]!;
          if (cur.endsWith("{")) depth++;
          if (cur === "}") {
            depth--;
            if (depth === 0) break;
          }
          inner.push(cur);
          i++;
        }
        if (depth !== 0) throw new Error("Unclosed if block '{ ... }'");
        if (evaluateCondition(cond, vars)) {
          execBlock(inner);
        }
        i++;
        continue;
      }

      const letMatch = line.match(/^(?:let\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?);?$/);
      if (letMatch) {
        const name = letMatch[1]!;
        vars[name] = evaluateSafeExpression(letMatch[2]!, vars);
        i++;
        continue;
      }

      const printMatch = line.match(/^print\s*\((.+)\);?$/i);
      if (printMatch) {
        outputs.push(String(evaluateSafeExpression(printMatch[1]!, vars)));
        i++;
        continue;
      }

      throw new Error(`Unsupported syntax near: "${line}"`);
    }
  };

  try {
    execBlock(lines);
    return { outputs, error: null, stepsExecuted: steps, variables: vars };
  } catch (err) {
    return {
      outputs,
      error: err instanceof Error ? err.message : "Syntax error",
      stepsExecuted: steps,
      variables: vars,
    };
  }
}

export interface PasswordStrengthReport {
  score: number; // 0..4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Resilient";
  feedback: string[];
}

export function evaluatePasswordStrength(pw: string): PasswordStrengthReport {
  const feedback: string[] = [];
  let points = 0;
  if (pw.length >= 8) points++;
  else feedback.push("Use at least 8–12 characters.");
  if (pw.length >= 12) points++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) points++;
  else feedback.push("Mix uppercase and lowercase letters.");
  if (/\d/.test(pw)) points++;
  else feedback.push("Add at least one number.");
  if (/[^A-Za-z0-9]/.test(pw)) points++;
  else feedback.push("Include a symbol (e.g. !, #, %).");

  const score = Math.min(4, Math.max(0, points - 1));
  const labels: PasswordStrengthReport["label"][] = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Resilient",
  ];
  return {
    score,
    label: labels[score] ?? "Weak",
    feedback,
  };
}

export interface RobotCommandResult {
  finalX: number;
  finalY: number;
  reachedGoal: boolean;
  hitWall: boolean;
  path: Array<{ x: number; y: number }>;
  trace: string[];
}

export const ROBOT_GRID_SIZE = 6;
export const ROBOT_OBSTACLES = new Set(["1,1", "2,3", "3,1", "4,3", "4,4"]);
export const ROBOT_GOAL = { x: 5, y: 4 };

export function runRobotCommands(commands: Array<"FWD" | "LEFT" | "RIGHT">): RobotCommandResult {
  let x = 0;
  let y = 0;
  // 0=East, 1=South, 2=West, 3=North
  let dir = 0;
  const path = [{ x, y }];
  const trace: string[] = [];
  let hitWall = false;

  for (const cmd of commands.slice(0, 40)) {
    if (cmd === "LEFT") {
      dir = (dir + 3) % 4;
      trace.push("TURN LEFT");
    } else if (cmd === "RIGHT") {
      dir = (dir + 1) % 4;
      trace.push("TURN RIGHT");
    } else {
      const dx = dir === 0 ? 1 : dir === 2 ? -1 : 0;
      const dy = dir === 1 ? 1 : dir === 3 ? -1 : 0;
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= ROBOT_GRID_SIZE ||
        ny >= ROBOT_GRID_SIZE ||
        ROBOT_OBSTACLES.has(`${nx},${ny}`)
      ) {
        hitWall = true;
        trace.push(`PROXIMITY ALERT: blocked at (${nx},${ny})`);
        break;
      }
      x = nx;
      y = ny;
      path.push({ x, y });
      trace.push(`MOVE -> (${x},${y})`);
      if (x === ROBOT_GOAL.x && y === ROBOT_GOAL.y) break;
    }
  }

  return {
    finalX: x,
    finalY: y,
    reachedGoal: x === ROBOT_GOAL.x && y === ROBOT_GOAL.y,
    hitWall,
    path,
    trace,
  };
}
