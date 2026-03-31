"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

interface PublisherTargetFormProps {
  onSubmit: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
}

interface FormSelectProps {
  name: string;
  value: string;
  disabled?: boolean;
  onValueChange: (value: string | null) => void;
  options: Array<{ value: string; label: string }>;
}

function FormSelect({ name, value, disabled, onValueChange, options }: FormSelectProps) {
  return (
    <Select
      name={name}
      value={value}
      onValueChange={(next) => onValueChange(next)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectList className="max-h-64 overflow-auto">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}

interface Publisher {
  value: string;
  label: string;
  hint: string;
}

const defaultPublishers: Publisher[] = [
  {
    value: "local-fs",
    label: "Local filesystem",
    hint: "Write published posts as files under a directory on this machine.",
  },
  {
    value: "github",
    label: "GitHub",
    hint: "Publish directly to a GitHub repository through the GitHub API.",
  },
];

export function PublisherTargetForm({ onSubmit, disabled }: PublisherTargetFormProps) {
  const [provider, setProvider] = useState<Publisher>(defaultPublishers[0]!);
  const [localGitExtension, setLocalGitExtension] = useState<"mdx" | "md">("mdx");
  const [githubExtension, setGithubExtension] = useState<"mdx" | "md">("mdx");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
      <div className="grid gap-1">
        <label className="text-xs text-fe-muted-foreground">Target Name</label>
        <Input name="name" required placeholder="e.g. Main blog publisher" disabled={disabled} />
      </div>

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="provider" className="text-xs text-fe-muted-foreground">
          Provider
        </label>
        <Select
          id="provider"
          name="provider"
          value={provider}
          onValueChange={(value) => value && setProvider(value)}
          disabled={disabled}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.value}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a publish destination">
              {(publisher: Publisher) => (
                <span>
                  <p className="font-medium mb-1">{publisher.label}</p>
                  <p className="text-xs text-fe-muted-foreground">{publisher.hint}</p>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectList className="max-h-64 overflow-auto">
              {defaultPublishers.map((option) => (
                <SelectItem key={option.value} value={option}>
                  <SelectItemText>
                    <p className="font-medium mb-1">{option.label}</p>
                    <p className="text-xs text-fe-muted-foreground">{option.hint}</p>
                  </SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      </fieldset>

      {provider.value === "local-fs" && (
        <div className="grid gap-3 rounded-md border border-fe-border bg-fe-muted p-3">
          <p className="text-xs font-medium text-fe-foreground">Local filesystem</p>
          <div className="grid gap-1">
            <label className="text-xs text-fe-muted-foreground">Base directory</label>
            <Input
              name="repoPath"
              required
              placeholder="/Users/you/dev/my-site"
              disabled={disabled}
            />
            <p className="text-[11px] text-fe-muted-foreground">
              Each post is saved as a file under the base directory, inside the posts folder, named
              after the post slug and chosen extension.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">Posts directory</label>
              <Input name="postsDir" defaultValue="content" disabled={disabled} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">File extension</label>
              <FormSelect
                name="extension"
                value={localGitExtension}
                onValueChange={(value) => setLocalGitExtension(value === "md" ? "md" : "mdx")}
                disabled={disabled}
                options={[
                  { value: "mdx", label: "mdx" },
                  { value: "md", label: "md" },
                ]}
              />
            </div>
          </div>
        </div>
      )}
      {provider.value === "github" && (
        <div className="grid gap-3 rounded-md border border-fe-border bg-fe-muted p-3">
          <p className="text-xs font-medium text-fe-foreground">GitHub Configuration</p>
          <div className="grid gap-1">
            <label className="text-xs text-fe-muted-foreground">GitHub Token</label>
            <Input
              name="token"
              type="password"
              required
              placeholder="ghp_xxx..."
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">Owner</label>
              <Input name="owner" required placeholder="org-or-user" disabled={disabled} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">Repository</label>
              <Input name="repo" required placeholder="blog-content" disabled={disabled} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">Branch</label>
              <Input name="branch" defaultValue="main" disabled={disabled} />
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <label className="text-xs text-fe-muted-foreground">Posts Directory</label>
              <Input name="postsDir" defaultValue="content" disabled={disabled} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">File Extension</label>
              <FormSelect
                name="extension"
                value={githubExtension}
                onValueChange={(value) => setGithubExtension(value === "md" ? "md" : "mdx")}
                disabled={disabled}
                options={[
                  { value: "mdx", label: "mdx" },
                  { value: "md", label: "md" },
                ]}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-fe-muted-foreground">Commit Message Template</label>
              <Input
                name="commitMessageTemplate"
                defaultValue="chore(cms): publish {slug}"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={disabled} className="w-fit px-3 py-2 text-sm">
        Add target
      </Button>
    </form>
  );
}
