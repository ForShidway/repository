"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const id =  params.id;
}
