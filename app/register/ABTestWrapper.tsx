"use client";

import { useEffect, useState } from "react";
import SinglePageRegister from "./page";
import MultiStepRegister from "./MultiStepRegister";
import { assignVariant } from "@/lib/ab-testing";

export default function ABTestWrapper() {
  const [variant, setVariant] = useState<string>("control");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取或分配 A/B 测试变体
    const userId = "anonymous"; // 实际应用中应该从 session 获取
    const assignedVariant = assignVariant("register-flow-test", userId);
    setVariant(assignedVariant || "control");
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 根据变体渲染不同的注册表单
  if (variant === "multi-step") {
    return <MultiStepRegister variant={variant} />;
  }

  return <SinglePageRegister />;
}
