"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Success",
      description: "Thank you for subscribing to our newsletter!",
    })

    setEmail("")
    setIsSubmitting(false)
  }

  return (
    <section className="py-16 bg-[#374027]">
      <div className="container mx-auto px-4">
        <div className="max-w-[544px] mx-auto text-center">
          <p className="text-[#E9EDDA] text-[24px] font-bold mb-2">No Spam Promise</p>
          <h2 className="text-[40px] font-bold text-white mb-4">Get more update from us</h2>
          <p className="text-[#D3D5DA] font-[400] text-[16px] mb-8">Discover ways to increase your home's value and get listed. No Spam.</p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>

          <p className="text-primary-200 text-sm">Join 10,000+ other users in our MJ's Haven community.</p>
        </div>
      </div>
    </section>
  )
}

