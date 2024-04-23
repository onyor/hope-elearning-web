"use client";

import { Input } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { createSkill, updateSkill } from "@/lib/actions";
import { Skill } from "@/lib/models";
import { parseErrorResponse } from "@/lib/parse-error-response";
import { setStringToSlug } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, {
    message: "Please enter skill name",
  }),
  slug: z.string().min(1, {
    message: "Please enter skill slug",
  }),
});

type SkillForm = z.infer<typeof schema>;

function SkillEdit({ data, close }: { data?: Skill; close?: () => void }) {
  const router = useRouter();

  const {
    control,
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm<SkillForm>({
    resolver: zodResolver(schema),
    defaultValues: data ?? {
      name: "",
      slug: "",
    },
  });

  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault();
        handleSubmit(async (values) => {
          try {
            if (!values.id) {
              await createSkill(values);
            } else {
              await updateSkill(values);
            }
            close?.();
            router.refresh();
          } catch (error) {
            toast.error(parseErrorResponse(error));
          }
        })();
      }}
    >
      <div className="gird grid-cols-1">
        <Input
          label="Skill"
          id="skill"
          type="text"
          wrapperClass="mb-4"
          placeholder="Enter skill"
          {...register("name", {
            onChange: (evt) => {
              const slug = setStringToSlug(evt.target.value) ?? "";
              setValue("slug", slug, {
                shouldValidate: !!slug,
              });
            },
          })}
          error={errors.name?.message}
        />
        <Controller
          control={control}
          name="slug"
          render={({ field, fieldState: { error } }) => {
            return (
              <Input
                label="Slug"
                id="slug"
                type="text"
                wrapperClass="mb-4"
                placeholder="Enter slug"
                value={field.value}
                onChange={(evt) => {
                  const slug = setStringToSlug(evt.target.value) ?? "";
                  setValue("slug", slug, {
                    shouldValidate: true,
                  });
                }}
                error={error?.message}
              />
            );
          }}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="default"
            className="mt-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          {isSubmitting && (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export default SkillEdit;
