import Logo from "../components/Logo";
import AuthSwitch from "../components/AuthSwitch";
import InputField from "../components/InputField";
import SocialAuth from "../components/SocialAuth";
import { useState } from 'react';
import { useRouter } from 'next/router';

function Register(){
    const [formData, setFormData] = useState { name: "", email: "", password: "", confirmPassword: "" };
    const [loading, setLoading] = useState (false);
    const [error, setError] = useState("");
}