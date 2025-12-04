import ChatBox from "@/app/chat/components/ChatBox";
import Sidebar from "@/app/chat/components/Sidebar";

const chat = () => {
  return (
    <div className="chat-warrper h-full flex">
      <div className="left w-[260px]">
        <Sidebar />
      </div>
      <div className="right h-full overflow-auto flex-auto">
        <ChatBox />
      </div>
    </div>
  )
}

export default chat;