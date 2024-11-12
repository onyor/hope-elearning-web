"use client";

import { updateLesson } from "@/lib/actions";
import { parseErrorResponse } from "@/lib/parse-error-response";
import { BlockEditor, TiptapEditor } from "@elearning/block-editor";
import { TitleInput } from "@elearning/ui/forms";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from "@elearning/ui";
import { Audit, Lesson } from "@elearning/lib/models";
import { debounce, setStringToSlug } from "@elearning/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cloud, CloudUpload, LoaderCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import LessonDeleteAlert from "./lesson-delete-alert";
import LessonSettingDialog from "./lesson-setting-dialog";
import QuizListing from "./quiz-listing";
import { BASE_URL } from "@/lib/constants";
import VideoUploader from "./video-uploader"; // Video yükleyici bileşeni eklendi

const schema = z.object({
  id: z.number(),
  title: z.string().min(1, {
    message: "Please enter lesson title",
  }),
  slug: z.string().optional(),
});

type LessonForm = z.infer<typeof schema>;

export default function LessonEditPage({ lesson }: { lesson: Lesson }) {
  const [data, setData] = useState(lesson);
  const [isStale, setStale] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [html, setHtml] = useState<string | null>(lesson.html || null);
  const [lexical, setLexical] = useState<string | null>(lesson.lexical || null);

  const auditRef = useRef<Audit>();
  const staleRef = useRef(false);
  const savingRef = useRef(false);
  const editorRef = useRef<TiptapEditor>();
  const { toast } = useToast();

  const handleVideoUpload = (file: File) => {
    setVideoFile(file); // Dosyayı state içine al

    // Video yüklendiğinde html ve lexical değerlerini güncelle
    const videoUrl = "http://localhost:5050/video"; // Test URL
    setLexical(JSON.stringify({ type: "video", source: videoUrl }));
    setHtml(`<video src="${videoUrl}" controls></video>`);
  };

  const { control, setValue, getValues } = useForm<LessonForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data.id,
    },
    values: {
      id: data.id,
      title: data.title,
      slug: data.slug,
    },
  });

  useEffect(() => {
    auditRef.current = lesson.audit;
  }, [lesson]);

  useEffect(() => {
    staleRef.current = isStale;
  }, [isStale]);

  useEffect(() => {
    savingRef.current = isSaving;
  }, [isSaving]);

  const handleUpdate = async () => {
    if (savingRef.current) {
      setStale(true);
      return;
    }

    try {
      setSaving(true);
      setStale(false);

      const values = getValues();
      const audit = auditRef.current;
      const editor = editorRef.current;

      // Text tipi içerikler için kaydetme işlemi
      if (lesson.type === "text" && editor) {
        const json = editor.getJSON();
        const htmlContent = editor.getHTML();
        setLexical(json ? JSON.stringify(json) : null);
        setHtml(htmlContent);
      }

      const body = {
        ...values,
        courseId: lesson.chapter?.course?.id,
        slug: !values.slug?.trim() ? lesson.slug : values.slug,
        lexical: lexical,
        html: html,
        updatedAt: audit?.updatedAt,
      };

      setValue("slug", body["slug"], { shouldValidate: true });

      const result = await updateLesson(lesson.chapter?.course?.id ?? 0, body);

      auditRef.current = result.audit;
      setData(result);

      if (lesson.chapter?.course?.status === "published") {
        toast({
          title: "Success",
          description: "Lesson updated",
          variant: "success",
        });
      }

      setSaving(false);
      savingRef.current = false;
      if (staleRef.current) {
        handleUpdate();
      }
    } catch (error) {
      setSaving(false);
      setStale(true);
      toast({
        title: "Error",
        description: parseErrorResponse(error),
        variant: "destructive",
      });
    }
  };

  const debouncedUpdate = debounce(handleUpdate, 2000);

  const saveStateView = () => {
    if (lesson.chapter?.course?.status === "published") {
      return null;
    }

    if (isSaving) {
      return (
        <LoaderCircle className="flex-shrink-0 animate-spin text-muted-foreground" />
      );
    }

    if (isStale) {
      return <CloudUpload className="flex-shrink-0 text-muted-foreground" />;
    }

    return <Cloud className="flex-shrink-0 text-success" />;
  };

  const content = () => {
    const handleClearVideo = () => {
      // Video kaldırıldığında html ve lexical alanlarını sıfırla
      setLexical(null);
      setHtml(null);
      setVideoFile(null);
    };

    if (lesson.type === "quiz") {
      return <QuizListing lesson={lesson} />;
    } else if (lesson.type === "video") {
      return (
        <VideoUploader
          onUpload={handleVideoUpload}
          initialUrl={lesson.lexical ? JSON.parse(lesson.lexical).source : null} // DB'deki video URL'si
          onClear={handleClearVideo} // Video kaldırma işlevi
        />
      );
    }

    return (
      <BlockEditor
        content={lesson.lexical ? JSON.parse(lesson.lexical) : undefined}
        aiProvider={{
          url: `${BASE_URL}/api/completion`,
        }}
        onCreate={(editor) => {
          editorRef.current = editor;
        }}
        onUpdate={(editor) => {
          editorRef.current = editor;
          if (lesson.chapter?.course?.status === "draft") {
            debouncedUpdate(undefined);
          }
        }}
      />
    );
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center space-x-3 fixed inset-x-0 top-0 bg-background px-4 h-[65px] border-b z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/admin/courses/${lesson.chapter?.course?.id}`}>
                    Course
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-nowrap">
                  Edit Lesson
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex-1"></div>
          {saveStateView()}
          {lesson.chapter?.course?.status === "published" && (
            <Button disabled={isSaving} onClick={handleUpdate}>
              {isSaving && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none" asChild>
              <Button variant="default" size="icon" disabled={isSaving}>
                <Settings className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-xl">
              <DropdownMenuItem onClick={() => setOpenSetting(true)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grow mt-[65px]">
          <div className="container max-w-3xl 2xl:max-w-4xl mt-7 mb-16">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/admin/courses/${lesson.chapter?.course?.id}`}>
                      {lesson.chapter?.course?.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{lesson.chapter?.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="mb-6">
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TitleInput
                    placeholder="Lesson title"
                    spellCheck={false}
                    maxLength={2000}
                    value={field.value ?? ""}
                    onChange={(evt) => {
                      field.onChange(evt);
                      const value = evt.target.value;
                      const slug = setStringToSlug(value);
                      setValue("slug", slug);
                      if (lesson.chapter?.course?.status === "draft") {
                        debouncedUpdate(undefined);
                      }
                    }}
                  />
                )}
              />
            </div>
            {content()}
          </div>
        </div>
      </div>

      <LessonSettingDialog
        lesson={lesson}
        isOpen={openSetting}
        afterUpdate={(result) => {
          auditRef.current = result.audit;
          setData(result);
        }}
        onOpenChange={setOpenSetting}
      />

      <LessonDeleteAlert
        lesson={lesson}
        isOpen={openDelete}
        onOpenChange={setOpenDelete}
      />
    </>
  );
}
