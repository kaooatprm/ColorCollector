import { Icon } from "@iconify/react";

export default function ColorPos({
  iconStyle,
  colorStyle,
  id,
  selectedIndex,
  onClick,
}: {
  id?: number; // Optional
  selectedIndex: number;
  iconStyle: string;
  colorStyle: string;
  onClick?: (id: number) => void;
}) {
  return (
    <div
      className={`flex p-2 border rounded-md border-[#b3b3b3] ${
        selectedIndex !== undefined && selectedIndex === id ? "bg-[#a3a3a3]" : ""
      }`}
      onClick={() => onClick?.(id ?? -1)} // ถ้า id เป็น undefined จะส่ง -1 แทน
    >
      <div className="flex justify-center items-center">
        <Icon icon={iconStyle} width={20} height={20} style={{ color: colorStyle }} />
      </div>
    </div>
  );
}
