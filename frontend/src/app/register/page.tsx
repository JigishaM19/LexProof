"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import {
  api,
  Country,
  State,
  District,
  Subdistrict,
  City,
  Institution,
  Course,
  Branch,
  AcademicStructure,
  PostalCodeValidation,
} from "@/lib/api";
import {
  User,
  Check,
  ArrowRight,
  Building,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  Sparkles,
  MapPin,
  Search,
  Hash,
  FileText,
  BadgeCheck,
} from "lucide-react";

// Verhoeff Algorithm for instant Aadhaar validation feedback
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validateVerhoeff(numStr: string): boolean {
  if (!/^\d+$/.test(numStr)) return false;
  let c = 0;
  const reversedDigits = numStr.split("").map(Number).reverse();
  for (let i = 0; i < reversedDigits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][reversedDigits[i]]];
  }
  return c === 0;
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/individual";
  const { t } = useI18n();

  // Step 1: Registration Form, Step 2: OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // -------------------------------------------------------------------------
  // 1. Personal Information State
  // -------------------------------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------------------------------------------------------
  // 2. Geographic / Address State (Cascading Dropdowns)
  // -------------------------------------------------------------------------
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState("IN");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState("");
  const [selectedSubdistrictName, setSelectedSubdistrictName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<PostalCodeValidation | null>(null);
  const [validatingPincode, setValidatingPincode] = useState(false);

  // -------------------------------------------------------------------------
  // 3. Academic & Student Information State (Dynamic Catalog)
  // -------------------------------------------------------------------------
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [academicStructure, setAcademicStructure] = useState<AcademicStructure | null>(null);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [customInstitutionName, setCustomInstitutionName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [customCourseName, setCustomCourseName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [customBranchName, setCustomBranchName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [academicSemester, setAcademicSemester] = useState("");
  const [academicStatus, setAcademicStatus] = useState("Pursuing / Active Student");
  const [academicStatusOther, setAcademicStatusOther] = useState("");

  const [studentIdType, setStudentIdType] = useState("College / University ID");
  const [studentIdTypeOther, setStudentIdTypeOther] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");

  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [showStudentSection, setShowStudentSection] = useState(true);

  // -------------------------------------------------------------------------
  // 4. Loading & Validation States
  // -------------------------------------------------------------------------
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingAcademics, setLoadingAcademics] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // 5. Step 2: OTP State
  // -------------------------------------------------------------------------
  const [verificationMethod, setVerificationMethod] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // -------------------------------------------------------------------------
  // Initial Data Fetch: Countries & Courses
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function initData() {
      try {
        setLoadingLocations(true);
        const [cList, crsResp] = await Promise.all([
          api.getCountries(),
          api.getCourses(),
        ]);
        setCountries(cList || []);
        setCourses(crsResp?.courses || []);

        // Load states for default India (IN)
        if (cList && cList.some((c) => c.id === "IN")) {
          const sList = await api.getStates("IN");
          setStates(sList || []);
        }
      } catch (err: any) {
        console.warn("Error fetching initial location/academic catalogue:", err);
      } finally {
        setLoadingLocations(false);
      }
    }
    initData();
  }, []);

  // When Country changes -> load States, reset lower levels & calling code
  const handleCountryChange = async (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedStateId("");
    setSelectedDistrictId("");
    setSelectedSubdistrictId("");
    setSelectedSubdistrictName("");
    setSelectedCityId("");
    setDistricts([]);
    setSubdistricts([]);
    setCities([]);
    setPincode("");
    setPincodeStatus(null);

    const cObj = countries.find((c) => c.id === countryId);
    if (cObj && cObj.calling_code) {
      setCountryCode(cObj.calling_code);
    }

    if (cObj?.has_states) {
      try {
        setLoadingLocations(true);
        const sList = await api.getStates(countryId);
        setStates(sList || []);
      } catch (err) {
        setStates([]);
      } finally {
        setLoadingLocations(false);
      }
    } else {
      setStates([]);
    }
  };

  // When State changes -> load Districts & filter Institutions
  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedDistrictId("");
    setSelectedSubdistrictId("");
    setSelectedSubdistrictName("");
    setSelectedCityId("");
    setDistricts([]);
    setSubdistricts([]);
    setCities([]);

    if (!stateId) return;

    try {
      setLoadingLocations(true);
      const [dList, instResp] = await Promise.all([
        api.getDistricts(stateId),
        api.getInstitutions({ stateId, countryId: selectedCountryId }),
      ]);
      setDistricts(dList || []);
      setInstitutions(instResp?.institutions || []);
    } catch (err) {
      console.warn("Failed loading state data:", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // When District changes -> load Subdistricts, Cities & narrow Institutions
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedSubdistrictId("");
    setSelectedSubdistrictName("");
    setSelectedCityId("");
    setSubdistricts([]);
    setCities([]);

    if (!districtId) return;

    try {
      setLoadingLocations(true);
      const [subdistrictList, cityList, instResp] = await Promise.all([
        api.getSubdistricts(districtId),
        api.getCities(districtId),
        api.getInstitutions({ districtId, stateId: selectedStateId, countryId: selectedCountryId }),
      ]);
      setSubdistricts(subdistrictList || []);
      setCities(cityList || []);
      if (instResp?.institutions && instResp.institutions.length > 0) {
        setInstitutions(instResp.institutions);
      }
    } catch (err) {
      console.warn("Failed loading district data:", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // When Subdistrict changes -> store name for payload
  const handleSubdistrictChange = (subdistrictId: string) => {
    setSelectedSubdistrictId(subdistrictId);
    const sdObj = subdistricts.find((sd) => sd.id === subdistrictId);
    setSelectedSubdistrictName(sdObj?.name || "");
  };

  // Pincode validation on blur or change
  const handlePincodeBlur = async () => {
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length < 3) {
      setPincodeStatus(null);
      return;
    }
    setValidatingPincode(true);
    try {
      const res = await api.validatePostalCode(cleanPin, selectedCountryId);
      setPincodeStatus(res);
      // Auto-populate state/district if returned and not yet chosen
      if (res.is_valid) {
        if (res.state_id && !selectedStateId) {
          setSelectedStateId(res.state_id);
          const dList = await api.getDistricts(res.state_id);
          setDistricts(dList || []);
        }
        if (res.district_id && !selectedDistrictId) {
          setSelectedDistrictId(res.district_id);
          const cList = await api.getCities(res.district_id);
          setCities(cList || []);
        }
      }
    } catch (err) {
      console.warn("Pincode validation notice:", err);
    } finally {
      setValidatingPincode(false);
    }
  };

  // When Institution changes -> filter Courses if specific catalogue exists
  const handleInstitutionChange = async (instId: string) => {
    setSelectedInstitutionId(instId);
    if (instId && instId !== "OTHER") {
      try {
        const crsResp = await api.getCourses({ institutionId: instId });
        if (crsResp?.courses && crsResp.courses.length > 0) {
          setCourses(crsResp.courses);
        }
      } catch (err) {
        console.warn("Course catalog fetch notice:", err);
      }
    }
  };

  // When Course changes -> fetch Branches and Academic Structure
  const handleCourseChange = async (crsId: string) => {
    setSelectedCourseId(crsId);
    setSelectedBranchId("");
    setAcademicYear("");
    setAcademicSemester("");

    if (!crsId || crsId === "OTHER") {
      setBranches([]);
      setAcademicStructure(null);
      return;
    }

    try {
      setLoadingAcademics(true);
      const [brResp, struct] = await Promise.all([
        api.getBranches({ courseId: crsId, institutionId: selectedInstitutionId || undefined }),
        api.getAcademicStructure({ courseId: crsId, institutionId: selectedInstitutionId || undefined }),
      ]);
      setBranches(brResp?.branches || []);
      setAcademicStructure(struct || null);
    } catch (err) {
      console.warn("Academic structure fetch notice:", err);
    } finally {
      setLoadingAcademics(false);
    }
  };

  // -------------------------------------------------------------------------
  // Form Validation
  // -------------------------------------------------------------------------
  const validateForm = (): boolean => {
    setErrorMsg(null);

    if (!firstName.trim()) {
      setErrorMsg("First name is required.");
      return false;
    }
    if (!lastName.trim()) {
      setErrorMsg("Last name is required.");
      return false;
    }

    const nameRegex = /^[a-zA-Z\s\.\'\-]+$/;
    if (!nameRegex.test(firstName.trim())) {
      setErrorMsg("First name contains invalid characters. Use letters, spaces, hyphens, or periods.");
      return false;
    }
    if (!nameRegex.test(lastName.trim())) {
      setErrorMsg("Last name contains invalid characters. Use letters, spaces, hyphens, or periods.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }

    const digitsOnlyMobile = mobile.replace(/\D/g, "");
    if (!mobile.trim() || digitsOnlyMobile.length < 10 || digitsOnlyMobile.length > 15) {
      setErrorMsg("Please enter a valid mobile number (10 to 15 digits).");
      return false;
    }

    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both passwords.");
      return false;
    }

    // Aadhaar Validation if entered
    if (aadhaarNumber.trim()) {
      const cleanAadhaar = aadhaarNumber.replace(/[\s\-]/g, "");
      if (cleanAadhaar.length !== 12 || !/^\d+$/.test(cleanAadhaar)) {
        setErrorMsg("Aadhaar Number must be exactly 12 digits.");
        return false;
      }
      if (cleanAadhaar.startsWith("0") || cleanAadhaar.startsWith("1")) {
        setErrorMsg("Invalid Aadhaar Number: cannot start with 0 or 1.");
        return false;
      }
      if (!validateVerhoeff(cleanAadhaar)) {
        setErrorMsg("Invalid Aadhaar Number checksum. Please double-check your 12-digit Aadhaar.");
        return false;
      }
    }

    // ABHA ID Validation if entered
    if (abhaId.trim()) {
      const cleanAbha = abhaId.replace(/[\s\-]/g, "");
      if (cleanAbha.length !== 14 || !/^\d+$/.test(cleanAbha)) {
        setErrorMsg("ABHA ID must be exactly 14 digits.");
        return false;
      }
    }

    // Custom institution requirement
    if (selectedInstitutionId === "OTHER" && !customInstitutionName.trim()) {
      setErrorMsg("Please enter the name of your unlisted educational institution.");
      return false;
    }

    // Custom course requirement
    if (selectedCourseId === "OTHER" && !customCourseName.trim()) {
      setErrorMsg("Please enter the name of your course/degree.");
      return false;
    }

    if (!termsAccepted) {
      setErrorMsg("You must accept the Terms of Service and Privacy Policy to create an account.");
      return false;
    }

    return true;
  };

  // -------------------------------------------------------------------------
  // Step 1 -> Step 2: Send OTP
  // -------------------------------------------------------------------------
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim().toLowerCase();
    setErrorMsg(null);
    setSendingOtp(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await api.sendOtp(target, "REGISTRATION", verificationMethod);
      setResendTimer(res.cooldown_seconds || 60);
      setOtp(["", "", "", "", "", ""]);
      setStep(2);
      setOtpSuccessMsg(res.message || "A 6-digit verification code has been dispatched.");
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim().toLowerCase();
    try {
      const res = await api.resendOtp(target, "REGISTRATION", verificationMethod);
      setResendTimer(res.cooldown_seconds || 60);
      setOtp(["", "", "", "", "", ""]);
      setOtpSuccessMsg(res.message || "A new verification code has been dispatched.");
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 50);
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // OTP Verification & Final Account Creation
  // -------------------------------------------------------------------------
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned && val !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned[cleaned.length - 1] : "";
    setOtp(newOtp);
    setOtpError(null);

    if (cleaned && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }

    if (cleaned && index === 5) {
      const full = [...newOtp.slice(0, 5), cleaned[cleaned.length - 1]].join("");
      if (full.length === 6) {
        finalizeRegistration(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    setOtpError(null);
    const focusIdx = Math.min(pasteData.length, 5);
    document.getElementById(`otp-input-${focusIdx}`)?.focus();

    if (pasteData.length === 6) {
      finalizeRegistration(pasteData);
    }
  };

  const finalizeRegistration = async (fullOtp: string) => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim().toLowerCase();

    try {
      // 1. Verify OTP with server
      await api.verifyOtp(target, fullOtp, "REGISTRATION");
      setOtpSuccessMsg("Identity verified! Completing secure account creation...");

      // 2. Resolve names and descriptions
      const countryObj = countries.find((c) => c.id === selectedCountryId);
      const stateObj = states.find((s) => s.id === selectedStateId);
      const districtObj = districts.find((d) => d.id === selectedDistrictId);
      const cityObj = cities.find((ci) => ci.id === selectedCityId);

      const instObj = institutions.find((i) => i.id === selectedInstitutionId);
      const effectiveInstName = selectedInstitutionId === "OTHER"
        ? customInstitutionName.trim()
        : instObj?.name || "";

      const crsObj = courses.find((c) => c.id === selectedCourseId);
      const effectiveCourseName = selectedCourseId === "OTHER"
        ? customCourseName.trim()
        : crsObj?.name || "";

      const brObj = branches.find((b) => b.id === selectedBranchId);
      const effectiveBranchName = selectedBranchId === "OTHER"
        ? customBranchName.trim()
        : brObj?.name || "";

      const cleanAadhaar = aadhaarNumber.replace(/[\s\-]/g, "") || undefined;
      const cleanAbha = abhaId.replace(/[\s\-]/g, "") || undefined;

      const registrationPayload = {
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        country_code: countryCode,
        mobile: mobile.trim() || undefined,
        password,
        role: "USER",
        user_type: "USER",
        terms_accepted: true,

        // Address Details
        country_id: selectedCountryId || "IN",
        country_name: countryObj?.name || "India",
        state_id: selectedStateId || undefined,
        state_name: stateObj?.name || undefined,
        district_id: selectedDistrictId || undefined,
        district_name: districtObj?.name || undefined,
        subdistrict_id: selectedSubdistrictId || undefined,
        subdistrict_name: selectedSubdistrictName || undefined,
        city_id: selectedCityId || undefined,
        city_name: cityObj?.name || undefined,
        pincode: pincode.trim() || undefined,

        // Student / Academic Details
        institution_id: selectedInstitutionId && selectedInstitutionId !== "OTHER" ? selectedInstitutionId : undefined,
        institution_name: effectiveInstName || undefined,
        custom_institution_name: selectedInstitutionId === "OTHER" ? customInstitutionName.trim() : undefined,
        institution: effectiveInstName || undefined,

        course_id: selectedCourseId && selectedCourseId !== "OTHER" ? selectedCourseId : undefined,
        course_name: effectiveCourseName || undefined,
        custom_course_name: selectedCourseId === "OTHER" ? customCourseName.trim() : undefined,
        course: effectiveCourseName || undefined,

        branch_id: selectedBranchId && selectedBranchId !== "OTHER" ? selectedBranchId : undefined,
        branch_name: effectiveBranchName || undefined,
        custom_branch_name: selectedBranchId === "OTHER" ? customBranchName.trim() : undefined,
        branch: effectiveBranchName || undefined,

        academic_year: academicYear.trim() || undefined,
        academic_semester: academicSemester.trim() || undefined,
        academic_status: academicStatus === "Other" ? academicStatusOther.trim() : academicStatus || undefined,
        academic_status_other: academicStatus === "Other" ? academicStatusOther.trim() : undefined,

        student_id_type: studentIdType === "Other" ? studentIdTypeOther.trim() : studentIdType || undefined,
        student_id_type_other: studentIdType === "Other" ? studentIdTypeOther.trim() : undefined,
        student_id_number: studentIdNumber.trim() || undefined,
        enrollment_id: studentIdNumber.trim() || undefined,

        aadhaar_number: cleanAadhaar,
        abha_id: cleanAbha,
      };

      // 3. Register user account
      await api.register(registrationPayload);

      // 3a. If user selected a custom (unlisted) institution, fire a background suggestion request
      //     so the admin team can review and add it to the verified catalogue.
      if (selectedInstitutionId === "OTHER" && customInstitutionName.trim()) {
        const stateObj2 = states.find((s) => s.id === selectedStateId);
        api.requestInstitution({
          institution_name: customInstitutionName.trim(),
          state: stateObj2?.name || selectedStateId || "Unknown",
          applicant_email: email.trim().toLowerCase(),
          notes: selectedCourseId === "OTHER"
            ? `Custom course: ${customCourseName.trim()}`
            : effectiveCourseName
              ? `Course: ${effectiveCourseName}`
              : undefined,
        }).catch(() => {/* fire-and-forget: institution request is non-critical */});
      }

      // 4. Auto sign-in
      const authResp = await api.login(email.trim().toLowerCase(), password);

      // 5. Navigate to workspace
      router.push(redirectParam || "/individual");
    } catch (err: any) {
      setOtpError(err.message || "Registration failed. Please check the code and try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf8ff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-[#0f2942] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Header Banner */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authoritative Academic Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0f2942] dark:text-white">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Join LexProof to securely verify educational credentials and manage tamper-proof forensic dossiers.
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-3 sm:p-4 mb-8">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Step 1 */}
            <div className={`flex items-center gap-3 ${step >= 1 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs transition-colors ${
                  step > 1
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-[#0f2942] dark:bg-blue-600 text-white"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "01"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 dark:text-slate-500">Step 1</span>
                <span className="font-semibold text-sm">Personal & Academic Details</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${step === 2 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs transition-colors ${
                  step === 2
                    ? "bg-[#0f2942] dark:bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                }`}
              >
                02
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 dark:text-slate-500">Step 2</span>
                <span className="font-semibold text-sm">Security Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-900 dark:text-rose-200 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 1: Registration Form                                         */}
        {/* ================================================================= */}
        {step === 1 && (
          <form
            onSubmit={handleProceedToOtp}
            className="space-y-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn"
          >
            {/* --------------------------------------------------------------- */}
            {/* SECTION 1: Personal Details                                     */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0f2942] dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Personal Details</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Provide your legal name and direct contact information.
                  </p>
                </div>
              </div>

              {/* Split Name Fields: First, Middle, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Aditi"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Middle Name <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kumar"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditi.sharma@example.com"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number (10–15 digits) *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono">
                      {countryCode}
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9820012345"
                      className="w-full h-10 px-3 rounded-r-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password (min. 8 characters) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* SECTION 2: Geographic & Address Details (Cascading)             */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="text-lg font-bold text-[#0f2942] dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Geographic & Address Details</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cascading administrative location hierarchy grounded in India Post and LGD registries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Country */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Country *
                  </label>
                  <select
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State / Province */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    State / Region
                  </label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={states.length === 0}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">-- Select State --</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    District
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={districts.length === 0}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">-- Select District --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subdistrict / Taluka – shows only when subdistricts are available */}
              {subdistricts.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subdistrict / Taluka
                  </label>
                  <select
                    value={selectedSubdistrictId}
                    onChange={(e) => handleSubdistrictChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">-- Select Subdistrict / Taluka --</option>
                    {subdistricts.map((sd) => (
                      <option key={sd.id} value={sd.id}>
                        {sd.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City / Taluka */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    City / Taluka
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    disabled={cities.length === 0}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">-- Select City / Taluka --</option>
                    {cities.map((ci) => (
                      <option key={ci.id} value={ci.id}>
                        {ci.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pincode / Postal Code */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      PIN / Postal Code
                    </label>
                    {validatingPincode && (
                      <span className="text-[10px] text-blue-600 flex items-center gap-1 font-mono">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    onBlur={handlePincodeBlur}
                    placeholder="e.g. 411001"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                  {pincodeStatus && (
                    <div className="text-[11px] mt-1 flex items-center gap-1 text-slate-500">
                      {pincodeStatus.is_valid ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {pincodeStatus.office_name
                            ? `Verified: ${pincodeStatus.office_name}`
                            : pincodeStatus.message}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {pincodeStatus.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* SECTION 3: Student & Academic Credentials Section               */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0f2942] dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Student & Academic Credentials</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your educational profile for streamlined authoritative document verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStudentSection(!showStudentSection)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  {showStudentSection ? "Collapse" : "Expand"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStudentSection ? "rotate-180" : ""}`} />
                </button>
              </div>

              {showStudentSection && (
                <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {/* Institution Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Educational Institution / University
                    </label>
                    <select
                      value={selectedInstitutionId}
                      onChange={(e) => handleInstitutionChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">-- Select Institution --</option>
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name}
                        </option>
                      ))}
                      <option value="OTHER">My institution is not listed</option>
                    </select>

                    {selectedInstitutionId === "OTHER" && (
                      <input
                        type="text"
                        required
                        value={customInstitutionName}
                        onChange={(e) => setCustomInstitutionName(e.target.value)}
                        placeholder="Enter full legal name of your institution / college"
                        className="w-full h-10 px-3 mt-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none animate-fadeIn"
                      />
                    )}
                  </div>

                  {/* Course & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Course */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Course / Degree Programme
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="">-- Select Degree Programme --</option>
                        {courses.map((crs) => (
                          <option key={crs.id} value={crs.id}>
                            {crs.name}
                          </option>
                        ))}
                        <option value="OTHER">My course / degree is not listed</option>
                      </select>

                      {selectedCourseId === "OTHER" && (
                        <input
                          type="text"
                          required
                          value={customCourseName}
                          onChange={(e) => setCustomCourseName(e.target.value)}
                          placeholder="Enter your course name (e.g. B.Tech in Robotics)"
                          className="w-full h-10 px-3 mt-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none animate-fadeIn"
                        />
                      )}
                    </div>

                    {/* Branch */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Branch / Specialization
                      </label>
                      <select
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        disabled={branches.length === 0 && selectedCourseId !== "OTHER"}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">-- Select Branch --</option>
                        {branches.map((br) => (
                          <option key={br.id} value={br.id}>
                            {br.name}
                          </option>
                        ))}
                        <option value="OTHER">My branch is not listed</option>
                      </select>

                      {selectedBranchId === "OTHER" && (
                        <input
                          type="text"
                          value={customBranchName}
                          onChange={(e) => setCustomBranchName(e.target.value)}
                          placeholder="Enter branch / department name"
                          className="w-full h-10 px-3 mt-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none animate-fadeIn"
                        />
                      )}
                    </div>
                  </div>

                  {/* Academic Year & Semester (Dynamic based on selected course structure) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Academic Year
                      </label>
                      {academicStructure?.year_options && academicStructure.year_options.length > 0 ? (
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="">-- Select Academic Year --</option>
                          {academicStructure.year_options.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          placeholder="e.g. 2024-2025 or Final Year"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Semester / Term
                      </label>
                      {academicStructure?.semester_options && academicStructure.semester_options.length > 0 ? (
                        <select
                          value={academicSemester}
                          onChange={(e) => setAcademicSemester(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="">-- Select Semester / Term --</option>
                          {academicStructure.semester_options.map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={academicSemester}
                          onChange={(e) => setAcademicSemester(e.target.value)}
                          placeholder="e.g. Semester 6"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  {/* Academic Status & Student ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Academic Status
                      </label>
                      <select
                        value={academicStatus}
                        onChange={(e) => setAcademicStatus(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Pursuing / Active Student">Pursuing / Active Student</option>
                        <option value="Completed / Graduated">Completed / Graduated</option>
                        <option value="Alumni">Alumni</option>
                        <option value="Discontinued">Discontinued</option>
                        <option value="Other">Other</option>
                      </select>
                      {academicStatus === "Other" && (
                        <input
                          type="text"
                          value={academicStatusOther}
                          onChange={(e) => setAcademicStatusOther(e.target.value)}
                          placeholder="Specify status"
                          className="w-full h-9 px-3 mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Student ID Type
                      </label>
                      <select
                        value={studentIdType}
                        onChange={(e) => setStudentIdType(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="College / University ID">College / University ID</option>
                        <option value="Enrollment / Registration Number">Enrollment / Registration Number</option>
                        <option value="Roll Number">Roll Number</option>
                        <option value="PRN (Permanent Registration Number)">PRN (Permanent Registration Number)</option>
                        <option value="Other">Other</option>
                      </select>
                      {studentIdType === "Other" && (
                        <input
                          type="text"
                          value={studentIdTypeOther}
                          onChange={(e) => setStudentIdTypeOther(e.target.value)}
                          placeholder="Specify ID type"
                          className="w-full h-9 px-3 mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Student ID / Roll / PRN Number
                      </label>
                      <input
                        type="text"
                        value={studentIdNumber}
                        onChange={(e) => setStudentIdNumber(e.target.value)}
                        placeholder="e.g. PRN-2024-0012"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Government Sensitive Identifiers (Optional with privacy note) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Government Identity Numbers (Optional & Non-Custodial)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Aadhaar Number */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Aadhaar Number (12 Digits)
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="12-digit number"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Validates with Verhoeff checksum. Encrypted at rest; masked in all responses.
                        </p>
                      </div>

                      {/* ABHA ID */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          ABHA ID (Ayushman Bharat Health Account)
                        </label>
                        <input
                          type="text"
                          maxLength={17}
                          value={abhaId}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, "").slice(0, 14);
                            if (d.length <= 2) setAbhaId(d);
                            else if (d.length <= 6) setAbhaId(`${d.slice(0, 2)}-${d.slice(2)}`);
                            else if (d.length <= 10) setAbhaId(`${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`);
                            else setAbhaId(`${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}-${d.slice(10)}`);
                          }}
                          placeholder="XX-XXXX-XXXX-XXXX"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Format: 14 digits separated into groups of 2-4-4-4.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------------- */}
            {/* SECTION 4: Preferred Verification Method & Terms                */}
            {/* --------------------------------------------------------------- */}
            <div className="space-y-4 pt-2">
              <label className="block font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Verification Channel Selection *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setVerificationMethod("EMAIL")}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    verificationMethod === "EMAIL"
                      ? "border-[#0f2942] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-1 ring-[#0f2942] dark:ring-blue-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${verificationMethod === "EMAIL" ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Email Verification</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Direct 6-digit code delivered to your email inbox.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setVerificationMethod("PHONE")}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    verificationMethod === "PHONE"
                      ? "border-[#0f2942] dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm ring-1 ring-[#0f2942] dark:ring-blue-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${verificationMethod === "PHONE" ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">Mobile SMS</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        SMS
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Instant SMS code delivered to your registered mobile phone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/resources/document-guidelines" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Privacy Policy
                    </Link>
                    , and consent to non-custodial cryptographic document verification under DPDP principles.
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Already registered?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Sign in here
                </Link>
              </div>

              <button
                type="submit"
                id="btn-proceed-to-otp"
                disabled={sendingOtp}
                className="w-full sm:w-auto px-8 py-3 bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* STEP 2: OTP Verification Screen                                   */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="space-y-6 max-w-lg mx-auto w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0f2942] dark:text-blue-400 flex items-center justify-center mx-auto">
                {verificationMethod === "PHONE" ? (
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#0f2942] dark:text-white">
                {verificationMethod === "PHONE" ? "Verify Mobile Number" : "Verify Email Address"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {verificationMethod === "PHONE" ? (
                  <>
                    A 6-digit SMS code has been sent to{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{mobile}</span>.
                  </>
                ) : (
                  <>
                    A 6-digit verification code has been sent to{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>HMAC-SHA256 Cryptographic Verification</span>
              </div>
            </div>

            {/* Success notification */}
            {otpSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {/* Error notification */}
            {otpError && (
              <div className="p-3 bg-red-50 dark:bg-rose-950/40 text-red-800 dark:text-rose-300 text-xs rounded-xl border border-red-200 dark:border-rose-900/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-rose-400" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6-Digit Code Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none transition-all"
                />
              ))}
            </div>

            {/* Submit Verification Button */}
            <button
              type="button"
              onClick={() => finalizeRegistration(otp.join(""))}
              disabled={otp.join("").length !== 6 || otpLoading}
              className="w-full h-11 bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizing Security Profile...</span>
                </>
              ) : (
                <>
                  <span>Verify & Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend and Back Buttons */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                ← Back to edit details
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || otpLoading}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] dark:bg-[#090d16]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2942] dark:text-blue-400" />
            <span className="text-xs text-slate-500 font-mono">Loading registration portal…</span>
          </div>
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
