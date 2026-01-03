export const withPrefix = (str, prefix, separator = ":") => {
  return `${prefix}${separator}${str}`;
};
