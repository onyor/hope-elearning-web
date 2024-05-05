import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value?: number | bigint) {
  if (typeof value === "undefined") {
    return "";
  }

  return Intl.NumberFormat("en-US").format(value);
}

export function formatAbbreviate(value?: number | bigint) {
  if (!value) {
    return "0";
  }

  return Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function formatTimestamp(timestamp?: number | string, withTime = false) {
  if (!timestamp) {
    return "";
  }
  let date = dayjs(timestamp);
  if (withTime) {
    return date.format("MMM DD, YYYY hh:mm A");
  }

  return date.format("MMM DD, YYYY");
}

export function debounce<I, R>(
  callback: (input: I) => R | Promise<R>,
  timeout = 2000
) {
  if (typeof window === "undefined") {
    return () => {};
  }
  let timer: NodeJS.Timeout;

  return (input: I) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      callback && callback(input);
    }, timeout);
  };
}

export function setEmptyOrString(v: any) {
  if (typeof v === "string") {
    return v.trim().length > 0 ? v.trim() : undefined;
  }

  return undefined;
}

export function setEmptyOrNumber(v: any) {
  if (!isNaN(parseFloat(v))) {
    const numRegex = "^([0-9]*[.])?[0-9]+$";
    return `${v}`.match(numRegex) ? parseFloat(v) : undefined;
  }

  return undefined;
}

export function setZeroOrNumber(v: any) {
  if (!isNaN(parseFloat(v))) {
    const numRegex = "^([0-9]*[.])?[0-9]+$";
    return `${v}`.match(numRegex) ? parseFloat(v) : undefined;
  }

  return 0;
}

export function setStringToSlug(v?: string) {
  return (
    v
      ?.replaceAll(/[^\w-\s]*/g, "")
      .replaceAll(/\s+/g, "-")
      .toLowerCase() ?? ""
  );
}

export function buildQueryParams(params: any) {
  if (typeof params !== "object" || params instanceof Array) {
    return "";
  }

  let query = "";

  for (const p in params) {
    const value = params[p];
    if (value === undefined || value === null) {
      continue;
    }

    const delimiter = query.length > 0 ? "&" : "?";

    if (value instanceof Array) {
      query += delimiter + value.map((v) => `${p}=${v}`).join("&");
    } else {
      query += delimiter + `${p}=${value}`;
    }
  }

  return query;
}
