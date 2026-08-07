"use client";

// Tags the page with the visitor's lead source on the client, so CSS can react
// to it. Currently used to hide the WhatsApp CTAs for paid-ad visitors (see the
// data-lead-source rule in globals.css). Renders nothing.

import { useEffect } from "react";

import { detectLeadSource } from "@/lib/use-source-contact";

export function LeadSourceFlag() {
  useEffect(() => {
    document.documentElement.setAttribute("data-lead-source", detectLeadSource());
  }, []);
  return null;
}
