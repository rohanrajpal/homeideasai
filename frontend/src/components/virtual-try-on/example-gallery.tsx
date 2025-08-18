import Image from "next/image";

export function ExampleGallery() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Endless Possibilities
          </h2>
          <p className="text-xl text-muted-foreground mx-auto max-w-[800px]">
            From simple elegance to elaborate artistry, our AI brings your
            vision to life
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            "Classic French manicure with a twist",
            "Marble effect with gold accents",
            "Abstract floral patterns",
            "Geometric minimalist design",
            "Glitter ombré fade",
            "Intricate mandala art",
            "Watercolor effect",
            "Modern negative space",
          ].map((description, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <Image
                src={`/placeholder.svg?height=400&width=400&text=Design+${i + 1}`}
                alt={description}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-4 left-4 right-4 text-white text-sm">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
