"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useCreateSizeModal } from "./use-create-size-modal";

const formSchema = z.object({
  label: z
    .string()
    .min(1, { message: "Size name must be between 1 and 20 characters" })
    .max(20, { message: "Size name must be between 1 and 20 characters" }),
});

export const useCreateSize = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { onClose } = useCreateSizeModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/sizes`, values, {
        withCredentials: true,
      });
      toast.success("Size created");
      form.reset();
      router.refresh();
      onClose();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return { form, loading, handleSubmit: form.handleSubmit(onSubmit) };
};
