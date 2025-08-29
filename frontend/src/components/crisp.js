"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("6a16aa05-c118-4495-b9eb-d5751d8bf59a");
  });

  return null;
};

export default CrispChat;
