import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminBulkUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const bulkUploadMutation = trpc.admin.bulkUploadImages.useMutation({
    onSuccess: () => {
      toast.success("Images uploaded successfully");
      setFiles([]);
      setCsvFile(null);
      setProgress(0);
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    if (!csvFile) {
      toast.error("Please select a CSV file with metadata");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("csv", csvFile);

    try {
      await bulkUploadMutation.mutateAsync({
        images: files,
        csvData: await csvFile.text(),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Bulk Image Upload">
      <div className="space-y-6">
        <p className="text-muted-foreground">Upload multiple product images with metadata</p>

        <div className="grid gap-6">
          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Prepare Your CSV File</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Create a CSV file with the following columns:
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                  productId,image1Filename,image2Filename,image3Filename,image4Filename,invoiceNumber,thriftStoreName,styleDescription,materialDescription,customInformation,image1Alt,image2Alt,image3Alt,image4Alt
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 2: Name Your Images</h3>
                <p className="text-sm text-muted-foreground">
                  Name image files to match the filenames in your CSV (e.g., product-123-img1.jpg)
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 3: Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Select all images and the CSV file, then click Upload
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Select images and CSV metadata file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CSV Upload */}
              <div>
                <Label htmlFor="csv-upload" className="block mb-2">
                  CSV Metadata File
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvSelect}
                  disabled={uploading}
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image-upload" className="block mb-2">
                  Product Images
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {files.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {files.length} image(s)
                  </p>
                )}
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Selected Images:</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {files.map((file, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              {uploading && (
                <div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0 || !csvFile}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
            </CardContent>
          </Card>

          {/* Example CSV */}
          <Card>
            <CardHeader>
              <CardTitle>Example CSV Format</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={`productId,image1Filename,image2Filename,image3Filename,image4Filename,invoiceNumber,thriftStoreName,styleDescription,materialDescription,customInformation,image1Alt,image2Alt,image3Alt,image4Alt
1,product-1-img1.jpg,product-1-img2.jpg,product-1-img3.jpg,product-1-img4.jpg,INV-001,Downtown Thrift,Classic denim with vintage wash,100% cotton durable twill,Original 1990s Levi's,Front view of jeans,Back view of jeans,Waistband detail,Leg opening detail
2,product-2-img1.jpg,product-2-img2.jpg,,,"INV-002,Uptown Vintage,Crisp oxford shirt perfect for business or casual,100% cotton poplin with mother of pearl buttons,Minimal wear excellent condition,Front view of shirt,Back view of shirt,Collar detail,Button detail`}
                className="font-mono text-xs"
                rows={8}
                readOnly
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
