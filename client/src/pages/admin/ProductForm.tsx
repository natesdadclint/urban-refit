import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const categories = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "other", label: "Other" },
];

const conditions = [
  { value: "like_new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export default function AdminProductForm() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEditing = !!params.id;
  
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    brand: string;
    category: "tops" | "bottoms" | "dresses" | "outerwear" | "accessories" | "shoes" | "bags" | "other";
    size: string;
    color: string;
    material: string;
    condition: "like_new" | "excellent" | "good" | "fair";
    originalCost: string;
    markupPercentage: string;
    thriftStoreId: string;
  }>({
    name: "",
    description: "",
    brand: "",
    category: "tops",
    size: "",
    color: "",
    material: "",
    condition: "good",
    originalCost: "",
    markupPercentage: "50",
    thriftStoreId: "",
  });

  const [image1, setImage1] = useState<{ file?: File; preview: string; url?: string }>({ preview: "" });
  const [image2, setImage2] = useState<{ file?: File; preview: string; url?: string }>({ preview: "" });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch existing product for editing
  const { data: existingProduct } = trpc.product.getById.useQuery(
    { id: parseInt(params.id || "0") },
    { enabled: isEditing }
  );

  // Fetch thrift stores for dropdown
  const { data: thriftStores } = trpc.thriftStore.listAll.useQuery();

  const utils = trpc.useUtils();

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setLocation("/admin/products");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.listAll.invalidate();
      toast.success("Product updated successfully!");
      setLocation("/admin/products");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingProduct?.product) {
      const p = existingProduct.product;
      setFormData({
        name: p.name,
        description: p.description || "",
        brand: p.brand || "",
        category: p.category,
        size: p.size || "",
        color: p.color || "",
        material: p.material || "",
        condition: p.condition,
        originalCost: p.originalCost,
        markupPercentage: p.markupPercentage,
        thriftStoreId: p.thriftStoreId?.toString() || "",
      });
      if (p.image1Url) setImage1({ preview: p.image1Url, url: p.image1Url });
      if (p.image2Url) setImage2({ preview: p.image2Url, url: p.image2Url });
    }
  }, [existingProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageNum: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (imageNum === 1) {
      setImage1({ file, preview });
    } else {
      setImage2({ file, preview });
    }
  };

  const removeImage = (imageNum: 1 | 2) => {
    if (imageNum === 1) {
      setImage1({ preview: "" });
      if (fileInput1Ref.current) fileInput1Ref.current.value = "";
    } else {
      setImage2({ preview: "" });
      if (fileInput2Ref.current) fileInput2Ref.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.originalCost || parseFloat(formData.originalCost) <= 0) {
      toast.error("Original cost must be greater than 0");
      return;
    }
    if (!image1.preview) {
      toast.error("At least one product image is required");
      return;
    }

    setIsUploading(true);

    try {
      // Upload images if new files were selected
      let image1Url = image1.url || "";
      let image2Url = image2.url || "";

      if (image1.file) {
        image1Url = await uploadImage(image1.file);
      }
      if (image2.file) {
        image2Url = await uploadImage(image2.file);
      }

      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        brand: formData.brand || undefined,
        category: formData.category,
        size: formData.size || undefined,
        color: formData.color || undefined,
        material: formData.material || undefined,
        condition: formData.condition,
        originalCost: parseFloat(formData.originalCost),
        markupPercentage: parseFloat(formData.markupPercentage),
        thriftStoreId: formData.thriftStoreId ? parseInt(formData.thriftStoreId) : undefined,
        image1Url: image1Url || undefined,
        image2Url: image2Url || undefined,
      };

      if (isEditing) {
        updateProduct.mutate({ id: parseInt(params.id!), ...productData });
      } else {
        createProduct.mutate(productData);
      }
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate sale price
  const originalCost = parseFloat(formData.originalCost) || 0;
  const markupPercentage = parseFloat(formData.markupPercentage) || 0;
  const salePrice = originalCost * (1 + markupPercentage / 100);
  const thriftStorePayout = salePrice * 0.1;
  const profit = salePrice - originalCost - thriftStorePayout;

  const isSubmitting = createProduct.isPending || updateProduct.isPending || isUploading;

  return (
    <AdminLayout title={isEditing ? "Edit Product" : "Add New Product"}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2"
        onClick={() => setLocation("/admin/products")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Vintage Levi's Denim Jacket"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the item, including any unique features or wear..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Levi's"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => handleSelectChange("category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., M, 32, 8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., Blue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="e.g., 100% Cotton"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) => handleSelectChange("condition", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload two images showing different viewpoints of the garment. 
                  Images should be square for best display.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Image 1 */}
                  <div>
                    <Label className="mb-2 block">Image 1 (Front) *</Label>
                    <input
                      ref={fileInput1Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 1)}
                      className="hidden"
                    />
                    {image1.preview ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image1.preview}
                          alt="Preview 1"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(1)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInput1Ref.current?.click()}
                        className="w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                      >
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-sm">Upload Image</span>
                      </button>
                    )}
                  </div>

                  {/* Image 2 */}
                  <div>
                    <Label className="mb-2 block">Image 2 (Back/Detail)</Label>
                    <input
                      ref={fileInput2Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 2)}
                      className="hidden"
                    />
                    {image2.preview ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image2.preview}
                          alt="Preview 2"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(2)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInput2Ref.current?.click()}
                        className="w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                      >
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-sm">Upload Image</span>
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing & Source */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="originalCost">Original Cost ($) *</Label>
                  <Input
                    id="originalCost"
                    name="originalCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalCost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    What you paid at the thrift store
                  </p>
                </div>

                <div>
                  <Label htmlFor="markupPercentage">Markup (%) *</Label>
                  <Input
                    id="markupPercentage"
                    name="markupPercentage"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.markupPercentage}
                    onChange={handleInputChange}
                    placeholder="50"
                    required
                  />
                </div>

                {originalCost > 0 && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sale Price</span>
                      <span className="font-semibold">NZ${salePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thrift Store (10%)</span>
                      <span className="text-orange-600">-NZ${thriftStorePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="font-medium">Your Profit</span>
                      <span className="font-semibold text-green-600">NZ${profit.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source */}
            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="thriftStoreId">Thrift Store Partner</Label>
                  <Select
                    value={formData.thriftStoreId}
                    onValueChange={(v) => handleSelectChange("thriftStoreId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {thriftStores?.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This store will receive 10% of the sale price
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Upload className="h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                <>
                  {isEditing ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
