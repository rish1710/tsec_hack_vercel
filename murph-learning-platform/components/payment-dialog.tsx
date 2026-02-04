"use client"

import { useState } from "react"
import { CreditCard, Clock, AlertCircle, Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Course } from "@/lib/api"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  onPaymentSuccess: (paymentData: PaymentData) => void
}

export interface PaymentData {
  paymentMethodId: string
  estimatedMinutes: number
  authorizedAmount: number
}

const estimatedDurations = [
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 45, label: "45 min" },
  { minutes: 60, label: "1 hour" },
]

export function PaymentDialog({ open, onOpenChange, course, onPaymentSuccess }: PaymentDialogProps) {
  const [step, setStep] = useState<"duration" | "payment" | "processing" | "success">("duration")
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  if (!course) return null

  const estimatedCost = selectedDuration * course.pricePerMinute

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleContinueToPayment = () => {
    setStep("payment")
  }

  const handlePayment = async () => {
    setStep("processing")
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setStep("success")
    
    // Wait a moment then call success callback
    setTimeout(() => {
      onPaymentSuccess({
        paymentMethodId: `pm_${Date.now()}`,
        estimatedMinutes: selectedDuration,
        authorizedAmount: estimatedCost,
      })
      // Reset dialog state
      setStep("duration")
      setCardNumber("")
      setExpiry("")
      setCvv("")
      setCardholderName("")
    }, 1500)
  }

  const handleClose = () => {
    if (step !== "processing") {
      onOpenChange(false)
      setStep("duration")
    }
  }

  const isPaymentValid = cardNumber.replace(/\s/g, "").length >= 16 && 
    expiry.length >= 5 && 
    cvv.length >= 3 && 
    cardholderName.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {step === "duration" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Start Learning Session</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select estimated duration for {course.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-sm text-muted-foreground">with {course.teacher}</p>
                  </div>
                </div>
                <p className="text-sm text-primary font-medium">Rs. {course.pricePerMinute}/min</p>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Estimated Duration</Label>
                <RadioGroup
                  value={selectedDuration.toString()}
                  onValueChange={(v) => setSelectedDuration(Number.parseInt(v))}
                  className="grid grid-cols-2 gap-3"
                >
                  {estimatedDurations.map((option) => (
                    <div key={option.minutes}>
                      <RadioGroupItem
                        value={option.minutes.toString()}
                        id={`duration-${option.minutes}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`duration-${option.minutes}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-secondary/30 p-4 hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <span className="text-lg font-semibold text-foreground">{option.label}</span>
                        <span className="text-sm text-muted-foreground">
                          Rs. {option.minutes * course.pricePerMinute}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Pay only for what you use</p>
                    <p className="text-muted-foreground mt-1">
                      We will authorize Rs. {estimatedCost} but only charge for actual minutes used. 
                      Unused amount will be refunded instantly.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleContinueToPayment} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Payment Details</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Authorize Rs. {estimatedCost} for your session
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-foreground">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName" className="text-foreground">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-foreground">Expiry</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-foreground">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    type="password"
                    className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Authorization Amount</span>
                  <span className="font-semibold text-foreground">Rs. {estimatedCost}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("duration")} 
                  className="flex-1 border-border text-foreground hover:bg-secondary/50 bg-transparent"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePayment} 
                  disabled={!isPaymentValid}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Authorize Payment
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">Processing Payment...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we authorize your payment</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-lg font-medium text-foreground">Payment Authorized!</p>
            <p className="text-sm text-muted-foreground mt-1">Starting your learning session...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
