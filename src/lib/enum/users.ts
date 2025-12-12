export const planOptions = [
  { label: "免费版", value: "free" },
  { label: "会员", value: "pro" }
];

export const transPlanOptions = () => {
  const rows = planOptions.find((item) => ({
    ...item
  }));
  return rows;
};
