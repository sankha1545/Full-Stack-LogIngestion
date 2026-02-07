import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TEMPLATES } from "@/data/templates";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function Templates() {
  return (
    <section className="relative px-6 mx-auto py-28 max-w-7xl">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] top-[-120px] left-[-120px]" />
      </div>

      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Templates
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Production-ready observability blueprints to help you debug faster,
          monitor smarter, and ship with confidence.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => {
          const Icon = t.icon;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link to={`/templates/${t.id}`} className="group">
                <Card className="relative h-full transition-all border bg-background/60 backdrop-blur hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="p-3 text-indigo-500 rounded-lg bg-indigo-600/10">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {t.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-2">
                      {t.stack.slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500 transition group-hover:gap-2">
                      View
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
