import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
}

interface ArticlesFilterProps {
  articles: Article[];
}

export default function ArticlesFilter({ articles }: ArticlesFilterProps) {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...Array.from(new Set(articles.map((article) => article.category)))];

  const filteredArticles =
    activeCategory === "Semua" ? articles : articles.filter((a) => a.category === activeCategory);

  const featuredArticle = articles.find((a) => a.featured);
  const gridArticles = filteredArticles.filter((a) => !a.featured || activeCategory !== "Semua");

  return (
    <div>
      {articles.length === 0 && <p className="text-muted-foreground">Belum ada artikel.</p>}

      {/* Categories */}
      <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-6">
        {categories.map((cat) => (
          <Button
            type="button"
            key={cat}
            onClick={() => setActiveCategory(cat)}
            variant={activeCategory === cat ? "default" : "outline"}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              activeCategory !== cat && "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Featured Article (Only visible when Semua is selected) */}
      {activeCategory === "Semua" && featuredArticle && (
        <div className="group relative mb-12 motion-preset-fade md:mb-16">
          <a href={`/articles/${featuredArticle.id}`} className="block">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border lg:aspect-card">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="pr-0 lg:pr-6">
                <div className="mb-5 flex items-center gap-3 text-xs font-semibold text-primary">
                  <span>{featuredArticle.category}</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span className="text-muted-foreground">{featuredArticle.date}</span>
                </div>
                <h2 className="mb-4 font-display text-4xl font-semibold leading-display text-foreground transition-colors group-hover:text-primary md:text-5xl">
                  {featuredArticle.title}
                </h2>
                <p className="mb-6 text-lg leading-7 text-muted-foreground md:leading-8">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${featuredArticle.author}&background=random`}
                      alt={featuredArticle.author}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{featuredArticle.author}</p>
                    <p className="text-xs text-muted-foreground">{featuredArticle.role}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      Baca artikel <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Regular Grid */}
      <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {gridArticles.map((article, index) => (
          <article
            key={article.id}
            className="group flex flex-col motion-preset-fade"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <a href={`/articles/${article.id}`} className="h-full flex flex-col">
              <div className="relative mb-5 aspect-card overflow-hidden rounded-xl border border-border">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
              </div>

              <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-primary">
                <span>{article.category}</span>
                <span className="w-1 h-1 bg-border rounded-full" />
                <span className="text-muted-foreground">{article.readTime}</span>
              </div>

              <h3 className="mb-3 font-display text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h3>

              <p className="mb-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {article.excerpt}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                <span className="text-xs font-bold text-foreground">{article.author}</span>
                <span className="text-xs text-muted-foreground">{article.date}</span>
              </div>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
