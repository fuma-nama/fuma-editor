"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WebSocketStatus, type onStatusParameters } from "@hocuspocus/provider";
import * as Y from "yjs";
import { DocumentEditor } from "@/components/document-editor";
import { PublishPopover } from "@/components/publish-popover";
import { canPublish } from "@/lib/auth/guards/client";
import { useCmsSession } from "@/routes/cms-session-context";
import { useCollab } from "@/routes/collab-context";
import { Badge, badgeVariantForCollabConnection } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

interface EditorProps {
  postId: string;
  targets: Array<{
    id: string;
    name: string;
    provider: "github" | "local-fs";
  }>;
  initial: {
    slug: string;
    title: string;
    description: string;
    body: string;
    status: "draft" | "published" | "archived";
  };
}

export function Editor(props: EditorProps) {
  const { membershipRole } = useCmsSession();
  const publishEnabled = canPublish(membershipRole);
  const collab = useCollab();
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const bodyDoc = useMemo(() => new Y.Doc(), []);
  const metaDoc = useMemo(() => new Y.Doc(), []);
  const metaMap = useMemo(() => metaDoc.getMap<string>("meta"), [metaDoc]);
  const [meta, setMeta] = useState({
    slug: props.initial.slug,
    title: props.initial.title,
    description: props.initial.description,
  });

  useEffect(() => {
    const provider = collab.createPostProvider(props.postId, "body", bodyDoc);
    const metaProvider = collab.createPostProvider(props.postId, "meta", metaDoc);
    setConnectionStatus("connecting");

    const onStatus = ({ status }: onStatusParameters) => {
      if (status === WebSocketStatus.Connected) {
        setConnectionStatus("connected");
        return;
      }
      if (status === WebSocketStatus.Connecting) {
        setConnectionStatus("connecting");
        return;
      }
      setConnectionStatus("disconnected");
    };
    const onAuthFailed = () => setConnectionStatus("error");
    const onDisconnect = () => setConnectionStatus("disconnected");
    provider.on("status", onStatus);
    provider.on("authenticationFailed", onAuthFailed);
    provider.on("disconnect", onDisconnect);

    if (!metaMap.has("slug")) metaMap.set("slug", props.initial.slug);
    if (!metaMap.has("title")) metaMap.set("title", props.initial.title);
    if (!metaMap.has("description")) metaMap.set("description", props.initial.description);

    const onMetaChange = () => {
      setMeta({
        slug: metaMap.get("slug") ?? "",
        title: metaMap.get("title") ?? "",
        description: metaMap.get("description") ?? "",
      });
    };

    onMetaChange();
    metaMap.observe(onMetaChange);

    return () => {
      metaMap.unobserve(onMetaChange);
      provider.off("status", onStatus);
      provider.off("authenticationFailed", onAuthFailed);
      provider.off("disconnect", onDisconnect);
      provider.destroy();
      metaProvider.destroy();
    };
  }, [
    collab,
    props.initial.description,
    props.initial.slug,
    props.initial.title,
    props.postId,
    bodyDoc,
    metaDoc,
    metaMap,
  ]);

  const updateMeta = useCallback(
    (field: "slug" | "title" | "description", value: string) => metaMap.set(field, value),
    [metaMap],
  );

  const editable = membershipRole !== "viewer";

  return (
    <>
      <Card className="flex flex-col gap-3 mb-4 p-4">
        <h3 className="text-sm font-medium text-fe-foreground mb-4">Properties</h3>

        <div className="grid gap-1">
          <label className="text-xs text-fe-muted-foreground">Title</label>
          <Input
            value={meta.title}
            onChange={(event) => updateMeta("title", event.target.value)}
            placeholder="Untitled post"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-fe-muted-foreground">Slug</label>
          <Input
            value={meta.slug}
            onChange={(event) => updateMeta("slug", event.target.value)}
            placeholder="post-slug"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-fe-muted-foreground">Description</label>
          <Textarea
            value={meta.description}
            onChange={(event) => updateMeta("description", event.target.value)}
            rows={4}
            placeholder="Summary shown in lists and metadata"
          />
        </div>

        <div>
          <PublishPopover
            postId={props.postId}
            canPublish={publishEnabled}
            targets={props.targets}
          />
        </div>
      </Card>

      <div className="flex min-h-0 flex-col gap-3">
        <Card className="overflow-hidden p-0">
          <DocumentEditor
            collaborationDocument={bodyDoc}
            content={props.initial.body}
            editable={editable}
            className="min-h-[min(28rem,70vh)] w-full max-w-none rounded-none border-0 shadow-none ring-0"
          />
        </Card>
      </div>
      <div className="sticky bottom-0 mt-auto -mx-(--viewport-padding) flex items-center gap-2 border-t border-fe-border bg-fe-card px-(--viewport-padding) py-2 text-xs text-fe-card-foreground">
        <p className="font-medium text-fe-foreground">Status</p>
        <Badge variant={badgeVariantForCollabConnection(connectionStatus)} className="font-mono">
          {connectionStatus}
        </Badge>
      </div>
    </>
  );
}
