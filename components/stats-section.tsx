export function StatsSection() {
    return (
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold">50k+</h3>
              <p className="text-gray-500">Renters</p>
            </div>
  
            <div className="hidden sm:block h-12 w-px bg-gray-300"></div>
  
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold">10k+</h3>
              <p className="text-gray-500">Shortlet</p>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  