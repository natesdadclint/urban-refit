import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, CheckCircle, DollarSign, Recycle, Clock, ArrowRight } from "lucide-react";

export default function SellToUs() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    brand: "",
    itemType: "" as "tops" | "bottoms" | "outerwear" | "shoes" | "accessories" | "",
    itemName: "",
    size: "",
    condition: "" as "like_new" | "excellent" | "good" | "fair" | "",
    description: "",
    originalPrice: "",
    askingPrice: "",
  });

  const submitMutation = trpc.sell.submit.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setSubmissionId(data.id);
      toast.success("Your item has been submitted for review");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit item");
      setIsSubmitting(false);
    },
  });

  const uploadMutation = trpc.sell.uploadImage.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        continue;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const { url } = await uploadMutation.mutateAsync({
            base64,
            filename: file.name,
            mimeType: file.type,
          });
          setImages((prev) => [...prev, url]);
        } catch {
          toast.error("Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemType || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    submitMutation.mutate({
      ...formData,
      itemType: formData.itemType as "tops" | "bottoms" | "outerwear" | "shoes" | "accessories",
      condition: formData.condition as "like_new" | "excellent" | "good" | "fair",
      image1Url: images[0] || undefined,
      image2Url: images[1] || undefined,
      image3Url: images[2] || undefined,
      image4Url: images[3] || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Submission Received</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for submitting your item. Our team will review it and get back to you within 2-3 business days.
              {submissionId && (
                <span className="block mt-2 font-medium text-foreground">
                  Reference Number: #{submissionId}
                </span>
              )}
            </p>
            <div className="bg-neutral-100 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Our team reviews your submission and assesses the item's condition and market value.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>If accepted, we'll send you a prepaid shipping label to send us the item.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Once received and verified, we'll process your payment or store credit within 48 hours.</span>
                </li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => { setSubmitted(false); setImages([]); setFormData({ ...formData, brand: "", itemType: "", itemName: "", size: "", condition: "", description: "", originalPrice: "", askingPrice: "" }); }}>
                Submit Another Item
              </Button>
              <Button asChild>
                <a href="/shop">Continue Shopping</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider text-neutral-400 mb-4">Circular Fashion</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sell Your Clothes.<br />Get Paid. Do Good.
            </h1>
            <p className="text-lg text-neutral-300 mb-8">
              Turn your unwanted quality menswear into cash. We buy premium brands in good condition 
              and give them a second life. No hassle, no fees, just fair prices.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-neutral-50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Submit</h3>
              <p className="text-sm text-muted-foreground">Fill out the form with your item details and photos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Review</h3>
              <p className="text-sm text-muted-foreground">We review your submission within 2-3 business days</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Ship</h3>
              <p className="text-sm text-muted-foreground">Send us your item with our prepaid shipping label</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Get Paid</h3>
              <p className="text-sm text-muted-foreground">Receive payment or store credit within 48 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Item</CardTitle>
                <CardDescription>
                  Tell us about the item you'd like to sell. We accept premium menswear brands in good condition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="For faster communication"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div>
                    <h3 className="font-semibold mb-4">Item Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="e.g., Levi's, Carhartt, Nike"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itemType">Item Type *</Label>
                        <Select
                          value={formData.itemType}
                          onValueChange={(value) => setFormData({ ...formData, itemType: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tops">Tops (Shirts, Polos, T-Shirts)</SelectItem>
                            <SelectItem value="bottoms">Bottoms (Pants, Jeans, Shorts)</SelectItem>
                            <SelectItem value="outerwear">Outerwear (Jackets, Coats, Hoodies)</SelectItem>
                            <SelectItem value="shoes">Shoes (Sneakers, Boots, Loafers)</SelectItem>
                            <SelectItem value="accessories">Accessories (Caps, Belts, Bags)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input
                          id="itemName"
                          value={formData.itemName}
                          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                          placeholder="e.g., 501 Original Fit Jeans"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size *</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="e.g., M, L, 32x32, US 10"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="condition">Condition *</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) => setFormData({ ...formData, condition: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="like_new">Like New - Tags attached or worn once</SelectItem>
                            <SelectItem value="excellent">Excellent - Minimal wear, no visible flaws</SelectItem>
                            <SelectItem value="good">Good - Light wear, minor imperfections</SelectItem>
                            <SelectItem value="fair">Fair - Visible wear but still wearable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Any additional details about the item (color, material, special features, flaws to note)"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="font-semibold mb-4">Pricing (Optional)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Help us understand your expectations. Final offer will be based on our assessment.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Purchase Price</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          placeholder="$0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="askingPrice">Your Asking Price</Label>
                        <Input
                          id="askingPrice"
                          type="number"
                          step="0.01"
                          value={formData.askingPrice}
                          onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                          placeholder="$0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h3 className="font-semibold mb-4">Photos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload up to 4 photos showing the item clearly. Include front, back, labels, and any flaws.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                          <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {images.length < 4 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-neutral-400 hover:text-foreground transition-colors"
                        >
                          <Upload className="w-6 h-6 mb-2" />
                          <span className="text-xs">Add Photo</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t">
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Item for Review"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By submitting, you agree to our terms of service and confirm that the item is authentic and accurately described.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Accept */}
      <section className="py-16 bg-neutral-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">What We Accept</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">We Love</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Premium brands (Levi's, Carhartt, Nike, Ralph Lauren, etc.)</li>
                  <li>Items in excellent or like-new condition</li>
                  <li>Classic styles that hold their value</li>
                  <li>Complete items with all original parts</li>
                  <li>Clean, odor-free garments</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-700 mb-3">We Cannot Accept</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Fast fashion or budget brands</li>
                  <li>Items with significant damage or stains</li>
                  <li>Counterfeit or replica items</li>
                  <li>Underwear, swimwear, or intimates</li>
                  <li>Items with strong odors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
