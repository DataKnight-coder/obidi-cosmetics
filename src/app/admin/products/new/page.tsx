"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createProductAction } from "@/actions/admin-products";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; objectKey: string; }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    priceKobo: "",
    stock: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Get Signature from Server
      const sigRes = await fetch("/api/upload/signature?folder=obidi-cosmetics/products");
      const sigData = await sigRes.json() as any;
      const { signature, timestamp, cloudName, apiKey } = sigData;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "obidi-cosmetics/products");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json() as any;

      if (uploadData.secure_url) {
        setImages(prev => [...prev, { url: uploadData.secure_url, objectKey: uploadData.public_id }]);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Check console for details.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    // In a full implementation, you should also call a server action to delete from Cloudinary
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await createProductAction({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.description.substring(0, 100),
        categoryId: formData.category,
        priceKobo: parseFloat(formData.priceKobo),
        stock: parseInt(formData.stock, 10),
        images,
      });

      if (res.success) {
        router.push("/admin/products");
      } else {
        alert(res.error);
      }
    } catch (err) {
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display-lg text-3xl">Create New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h2 className="font-headline-lg text-xl">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant">Slug</label>
              <input 
                required
                type="text" 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-on-surface-variant">Description</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant">Category</label>
              <input 
                required
                type="text" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h2 className="font-headline-lg text-xl">Images (Cloudinary)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/50">
                <Image src={img.url} alt="Upload" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <button 
                  type="button" 
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-error rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-white/5">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              {uploadingImage ? (
                <Loader2 className="animate-spin text-primary" size={24} />
              ) : (
                <>
                  <UploadCloud size={24} className="text-on-surface-variant mb-2" />
                  <span className="text-xs text-on-surface-variant text-center px-4">Upload Image</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
          <h2 className="font-headline-lg text-xl">Pricing & Inventory (Default Variant)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant">Price (₦)</label>
              <input 
                required
                type="number" 
                value={formData.priceKobo}
                onChange={e => setFormData({...formData, priceKobo: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-on-surface-variant">Initial Stock</label>
              <input 
                required
                type="number" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" className="px-8 py-4 rounded-full font-label-sm uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading || uploadingImage}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-sm uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
