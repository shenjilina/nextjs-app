"use client";

import * as React from "react";
import { Controller, type ControllerProps, type FieldPath, type FieldValues, FormProvider, type FormProviderProps } from "react-hook-form";
import { cn } from "../../lib/utils";

export type FormProps<TFieldValues extends FieldValues = FieldValues> = FormProviderProps<TFieldValues>;

export function Form<TFieldValues extends FieldValues>({ ...props }: FormProps<TFieldValues>) {
  return <FormProvider {...props} />;
}

export type FormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = ControllerProps<
  TFieldValues,
  TName
>;

export function FormField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: FormFieldProps<TFieldValues, TName>
) {
  return <Controller {...props} />;
}

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FormControl({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />;
}

export function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-destructive", className)} {...props} />;
}
