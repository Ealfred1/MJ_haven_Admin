"use client"

import { useState } from "react"

const testimonials = [
  {
    id: 1,
    quote:
      "MJ's Haven is the platform I go to on almost a daily basis for 2nd home and vacation condo shopping, or to just look at dream homes in new areas. Thanks for fun home shopping and comparative analyzing, MJ's Haven!",
    name: "Mira Culos",
    role: "Renter",
    avatar: "/img1.svg",
  },
  {
    id: 2,
    quote:
      "As a property manager, MJ's Haven has simplified my workflow tremendously. The platform is intuitive and the customer service is exceptional.",
    name: "John Smith",
    role: "Property Manager",
    avatar: "/img2.svg",
  },
  {
    id: 3,
    quote:
      "I've been a hunter for so long, anytime I need a place to stay, I always come to MJ's Haven. I've been using it for years and it's never let me down.",
    name: "Sung Jinwoo",
    role: "Hunter",
    avatar: "/img3.jpg",
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-16 bg-grad">
      <div className="container max-w-[746px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-[40px] text-[#000929] font-bold mb-2">Testimonials</h2>
          <p className="text-[#1C1B20B2] text-center font-medium mx-auto max-w-[406px] text-[18px]">See what our property managers, landlords, and tenants have to say</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg">
            <p className="text-lg font-medium text-center text-[#000929] mb-6">"{testimonials[activeIndex].quote}"</p>

            <div className="flex justify-center items-center">
              <img
                src={testimonials[activeIndex].avatar || "/placeholder.svg"}
                alt={testimonials[activeIndex].name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-bold">{testimonials[activeIndex].name}</p>
                <p className="text-gray-500">{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                  activeIndex === index ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={testimonials[index].avatar || "/placeholder.svg"}
                  alt={testimonials[index].name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

