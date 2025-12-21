"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Loader2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import useFetch from "../../../lib/hooks/useFetch";

const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空").max(64, "用户名长度不能超过 64 个字符"),
  password: z.string().min(6, "密码长度至少 6 位").max(128, "密码长度不能超过 128 个字符")
});

type LoginFormState = z.infer<typeof loginSchema>;

const loginFieldSchema = {
  username: loginSchema.shape.username,
  password: loginSchema.shape.password
} satisfies Record<keyof LoginFormState, z.ZodTypeAny>;

type LoginModelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoginModelDialog({ open, onOpenChange }: LoginModelDialogProps) {
  const { post } = useFetch();
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>();

  const form = useForm<LoginFormState>({
    defaultValues: {
      username: "",
      password: ""
    },
    mode: "onChange"
  });

  const rules = {
    username: {
      validate: (value: string) => {
        const result = loginFieldSchema.username.safeParse(value);
        if (result.success) return true;
        return result.error.issues[0]?.message || "用户名格式不正确";
      }
    },
    password: {
      validate: (value: string) => {
        const result = loginFieldSchema.password.safeParse(value);
        if (result.success) return true;
        return result.error.issues[0]?.message || "密码格式不正确";
      }
    }
  };

  const onSubmit = async (values: LoginFormState) => {
    try {
      setSubmitting(true);
      setGlobalError(undefined);

      await post(
        "/api/v1/login",
        {
          email: values.username,
          username: values.username,
          password: values.password
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      onOpenChange(false);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "登录失败，请检查账号密码后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 text-center">
          <DialogTitle className="text-xl font-semibold">登录或注册</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">您将获得更加智能的回复并能上传文件、图片等内容。</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="username"
                rules={rules.username}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="用户名"
                        {...field}
                        disabled={submitting}
                        aria-invalid={!!fieldState.error}
                        onChange={(event) => {
                          setGlobalError(undefined);
                          field.onChange(event);
                        }}
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                rules={rules.password}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="密码（至少 6 位）"
                        {...field}
                        disabled={submitting}
                        aria-invalid={!!fieldState.error}
                        onChange={(event) => {
                          setGlobalError(undefined);
                          field.onChange(event);
                        }}
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              {globalError && <FormMessage>{globalError}</FormMessage>}

              <Button type="submit" className="w-full h-10 rounded-full text-sm font-medium" disabled={submitting}>
                {submitting && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                注册并登录
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
