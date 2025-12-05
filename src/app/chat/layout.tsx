import Sidebar from "@/app/chat/components/Sidebar";

const chatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="chat-warrper h-full flex">
      <div className="left w-[260px]">
        <Sidebar />
      </div>
      <div className="right h-full overflow-auto flex-auto">
        {children}
      </div>
    </div>
  );
};

export default chatLayout;
