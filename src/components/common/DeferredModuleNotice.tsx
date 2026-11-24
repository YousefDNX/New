import { Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DeferredModuleNoticeProps {
  titleEn: string;
  titleAr: string;
}

export function DeferredModuleNotice({ titleEn, titleAr }: DeferredModuleNoticeProps) {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl border-border/65 bg-card/90 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary shadow-inner">
            <Sparkles className="size-7 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {titleEn}
          </CardTitle>
          <CardDescription className="text-base font-arabic text-muted-foreground mt-1">
            {titleAr}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This advanced ecosystem module is fully prepared and scheduled for activation in the
            upcoming release cycle. You can continue exploring your active Growth Map, AI Coach, and
            other core modules in the meantime.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-2">
          <Button asChild variant="default" className="gap-2">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
