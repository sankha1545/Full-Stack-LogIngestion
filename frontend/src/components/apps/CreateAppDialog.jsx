"use client";

import { useState, useEffect } from "react";
import slugify from "slugify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2, Rocket } from "lucide-react";

import { createApp } from "@/api/appsApi";

/**
 * =====================================================
 * PREMIUM SAAS CREATE APPLICATION MODAL
 * =====================================================
 */

export default function CreateAppModal({
  open,
  onClose,
  onCreated,
}) {

  const [form, setForm] = useState({

    name: "",
    slug: "",
    description: "",

    environment: "PRODUCTION",

    framework: "Next.js",

    region: "us-east-1",

  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  /**
   * Reset form
   */

  useEffect(() => {

    if (open) {

      setForm({

        name: "",
        slug: "",
        description: "",
        environment: "PRODUCTION",
        framework: "Next.js",
        region: "us-east-1",

      });

      setError("");

    }

  }, [open]);



  /**
   * Auto generate slug
   */

  useEffect(() => {

    if (form.name) {

      setForm(prev => ({

        ...prev,

        slug: slugify(form.name, { lower: true })

      }));

    }

  }, [form.name]);



  /**
   * Handle input
   */

  function handleChange(field, value) {

    setForm(prev => ({

      ...prev,

      [field]: value

    }));

  }



  /**
   * Create app
   */

  async function handleCreate() {

    if (!form.name) {

      setError("Application name required");

      return;

    }

    try {

      setLoading(true);

      const res = await createApp(form);

      onCreated?.(res.data);

      onClose?.();

    }

    catch (err) {

      setError(err.message);

    }

    finally {

      setLoading(false);

    }

  }



  return (

    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-lg">

        {/* HEADER */}

        <DialogHeader>

          <DialogTitle className="flex items-center gap-2 text-xl">

            <Rocket className="w-5 h-5 text-primary"/>

            Create Application

          </DialogTitle>

          <DialogDescription>

            Add a new application to monitor logs and performance.

          </DialogDescription>

        </DialogHeader>



        {/* ERROR */}

        {error && (

          <div className="text-sm text-red-500">

            {error}

          </div>

        )}



        {/* FORM */}

        <div className="space-y-4">



          {/* NAME */}

          <div>

            <Label>Application Name</Label>

            <Input

              placeholder="Smart Bookmark"

              value={form.name}

              onChange={(e)=>handleChange("name", e.target.value)}

            />

          </div>



          {/* SLUG */}

          <div>

            <Label>Project Slug</Label>

            <Input

              value={form.slug}

              disabled

            />

          </div>



          {/* DESCRIPTION */}

          <div>

            <Label>Description</Label>

            <Input

              placeholder="Production logging for bookmark app"

              value={form.description}

              onChange={(e)=>handleChange("description", e.target.value)}

            />

          </div>



          {/* ENVIRONMENT */}

          <div>

            <Label>Environment</Label>

            <select

              className="w-full p-2 border rounded-md"

              value={form.environment}

              onChange={(e)=>handleChange("environment", e.target.value)}

            >

              <option value="DEVELOPMENT">

                Development

              </option>

              <option value="STAGING">

                Staging

              </option>

              <option value="PRODUCTION">

                Production

              </option>

            </select>

          </div>



          {/* FRAMEWORK */}

          <div>

            <Label>Framework</Label>

            <select

              className="w-full p-2 border rounded-md"

              value={form.framework}

              onChange={(e)=>handleChange("framework", e.target.value)}

            >

              <option>Next.js</option>

              <option>React</option>

              <option>Node.js</option>

              <option>Express</option>

              <option>Django</option>

              <option>Spring Boot</option>

            </select>

          </div>



          {/* REGION */}

          <div>

            <Label>Region</Label>

            <select

              className="w-full p-2 border rounded-md"

              value={form.region}

              onChange={(e)=>handleChange("region", e.target.value)}

            >

              <option value="us-east-1">

                US East

              </option>

              <option value="eu-west-1">

                Europe

              </option>

              <option value="ap-south-1">

                India

              </option>

            </select>

          </div>



        </div>



        {/* FOOTER */}

        <Button

          className="w-full mt-4"

          onClick={handleCreate}

          disabled={loading}

        >

          {loading && (

            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>

          )}

          Create Application

        </Button>



      </DialogContent>

    </Dialog>

  );

}