"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("411973bd-6637-48f2-9f7b-8ac63c4c3021");
  });

  return null;
};

export default CrispChat;
