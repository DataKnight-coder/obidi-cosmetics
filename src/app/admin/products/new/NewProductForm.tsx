"use client";

import { createProductAction } from "@/actions/admin-products";
import { ArrowLeft, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CategoryOption = {
  id: string;
  name: string;
};

type UploadResponse = {
  url?: string;
  objectKey?: string;
  error?: string;
};

export default function NewProductForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; objectKey: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    priceNaira: "",
    stock: "",
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (images.length >= 12) {
      setError("You can upload up to 12 images per product.");
      return;
    }

    setError("");
    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadData = (await uploadResponse.json()) as UploadResponse;

      if (!uploadResponse.ok || !uploadData.url || !uploadData.objectKey) {
        throw new Error(uploadData.error || "The image could not be uploaded.");
      }

      const uploadedImage = {
        url: uploadData.url,
        objectKey: uploadData.objectKey,
      };

      setImages((currentImages) => [
        ...currentImages,
        uploadedImage,
      ]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createProductAction({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.description.substring(0, 100),
        categoryId: formData.categoryId,
        priceNaira: Number(formData.priceNaira),
        stock: Number(formData.stock),
        images,
      });

      if (!result.success) {
        setError(result.error || "The product could not be saved.");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("The product could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClassName =
    "bg-white/5 border border-white/10 rounded-xl p-3 text-on-surface focus:border-primary outline-none";

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          aria-label="Back to products"
          className="rounded-full bg-white/5 p-3 transition-colors hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display-lg text-3xl">Create New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="glass-card flex flex-col gap-6 rounded-3xl border border-white/10 p-8">
          <h2 className="font-headline-lg text-xl">Basic Details</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="product-name" className="text-sm text-on-surface-variant">
                Product Name
              </label>
              <input
                id="product-name"
                required
                maxLength={160}
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                    slug: event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  })
                }
                className={fieldClassName}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="product-slug" className="text-sm text-on-surface-variant">
                Slug
              </label>
              <input
                id="product-slug"
                required
                maxLength={191}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                type="text"
                value={formData.slug}
                onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                className={fieldClassName}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="product-description" className="text-sm text-on-surface-variant">
                Description
              </label>
              <textarea
                id="product-description"
                required
                maxLength={10_000}
                rows={4}
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                className={`${fieldClassName} resize-none`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="product-category" className="text-sm text-on-surface-variant">
                Category
              </label>
              <select
                id="product-category"
                required
                value={formData.categoryId}
                onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                className={fieldClassName}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 ? (
                <p className="text-sm text-error">No categories are available. Add a category before creating products.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6 rounded-3xl border border-white/10 p-8">
          <div>
            <h2 className="font-headline-lg text-xl">Images</h2>
            <p className="mt-1 text-sm text-on-surface-variant">The first image will be the main product image.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.objectKey}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/50"
              >
                <Image
                  src={image.url}
                  alt={`Product upload ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <button
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() =>
                    setImages((currentImages) =>
                      currentImages.filter((_, imageIndex) => imageIndex !== index),
                    )
                  }
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 opacity-100 transition-colors hover:bg-error md:opacity-0 md:group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {images.length < 12 ? (
              <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 transition-colors hover:border-primary">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="animate-spin text-primary" size={24} />
                ) : (
                  <>
                    <UploadCloud size={24} className="mb-2 text-on-surface-variant" />
                    <span className="px-4 text-center text-xs text-on-surface-variant">Upload Image</span>
                  </>
                )}
              </label>
            ) : null}
          </div>
        </div>

        <div className="glass-card flex flex-col gap-6 rounded-3xl border border-white/10 p-8">
          <h2 className="font-headline-lg text-xl">Pricing &amp; Inventory</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="product-price" className="text-sm text-on-surface-variant">
                Price (₦)
              </label>
              <input
                id="product-price"
                required
                min="0.01"
                max="100000000"
                step="0.01"
                inputMode="decimal"
                type="number"
                value={formData.priceNaira}
                onChange={(event) => setFormData({ ...formData, priceNaira: event.target.value })}
                className={fieldClassName}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="product-stock" className="text-sm text-on-surface-variant">
                Initial Stock
              </label>
              <input
                id="product-stock"
                required
                min="0"
                max="1000000000"
                step="1"
                inputMode="numeric"
                type="number"
                value={formData.stock}
                onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                className={fieldClassName}
              />
            </div>
          </div>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/products"
            className="rounded-full bg-white/5 px-8 py-4 font-label-sm uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingImage || categories.length === 0}
            className="rounded-full bg-primary px-8 py-4 font-label-sm uppercase tracking-widest text-on-primary transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
