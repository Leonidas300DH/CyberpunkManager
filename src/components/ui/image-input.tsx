'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageInputProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export function ImageInput({ value = '', onChange, label = "Image URL", placeholder = "https://..." }: ImageInputProps) {
    const [preview, setPreview] = useState(value);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    return (
        <div className="flex items-center space-x-4">
            <div className="shrink-0">
                <Avatar className="h-16 w-16 rounded-md border border-border">
                    <AvatarImage src={preview} className="object-cover aspect-square" />
                    <AvatarFallback className="rounded-md">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-1 space-y-2">
                <Label>{label}</Label>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
