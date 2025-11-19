"use client"
import { useState } from "react";

const [loading, setLoading] = useState(false);

const alterLoading = (state) => {
  setLoading(state);
}

export {loading, alterLoading};