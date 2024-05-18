"use client";

import { NovelEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { updateSiteSetting } from "@/lib/actions";
import { parseErrorResponse } from "@/lib/parse-error-response";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export default function AboutUsPage({ value }: { value?: JSON }) {
  const [aboutUs, setAboutUs] = useState(
    value ? JSON.stringify(value) : undefined
  );
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSiteSetting({ aboutUs: aboutUs });
      toast({
        title: "Success",
        description: "About us updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: parseErrorResponse(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-3xl 2xl:max-w-4xl px-0 mb-10">
      <div className="flex items-center space-x-2 mb-4">
        <h2>About Us</h2>
        <div className="flex-grow"></div>
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          Save
        </Button>
      </div>
      <Separator className="mb-6" />
      <NovelEditor
        content={value ? value : undefined}
        onChange={(editor) => {
          const json = editor.getJSON();
          setAboutUs(JSON.stringify(json));
        }}
      />
    </div>
  );
}
