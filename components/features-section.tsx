import { Shield, DollarSign, Clock } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="pt-16 pb-32">
      <div className="container max-w-[1128px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What we offer you</h2>
          <p className="text-gray-500">Some of our picked properties near your location.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Secured Property */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 ring-[1px] ring-[#E9EDDA] ring-offset-2 rounded-full bg-[#E9EDDA] flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-800" />
              </div>
              <div className="absolute bottom-0 -right-2 w-[24px] h-[24px] rounded-full bg-[#374027] flex items-center justify-center">
                <div className="text-white text-sm">✓</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 mt-4">Secured Property</h3>
            <p className="text-gray-500">
              We offer our customer property protection of liability coverage and insurance for their better life.
            </p>
          </div>

          {/* Best Price */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 ring-[1px] ring-[#E9EDDA] ring-offset-2 rounded-full bg-[#E9EDDA] flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-green-800" />
              </div>
              <div className="absolute bottom-0 -right-2 w-[24px] h-[24px] rounded-full bg-[#374027] flex items-center justify-center">
                <div className="text-white text-sm">$</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 mt-4">Best Price</h3>
            <p className="text-gray-500">
              Not sure what you should be charging for your property? No need to worry, let us do the numbers for you.
            </p>
          </div>

          {/* Seamless booking */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 ring-[1px] ring-[#E9EDDA] ring-offset-2 rounded-full bg-[#E9EDDA] flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-green-800" />
              </div>
              <div className="absolute bottom-0 -right-2 w-[24px] h-[24px] rounded-full bg-[#374027] flex items-center justify-center">
                <div className="text-white text-sm">⌚</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 mt-4">Seamless booking</h3>
            <p className="text-gray-500">
              Enjoy hassle-free booking with our streamlined process that saves you time and effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}