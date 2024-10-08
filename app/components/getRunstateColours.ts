export function getForegroundColor(status: string | undefined): string {
  switch (status) {
    case undefined:
    case "UNKNOWN":
      return "text-black";
    case "PAUSED":
      return "text-white";
    case "PAUSING":
      return "text-white";
    case "RESUMING":
      return "text-white";
    case "RUNNING":
      return "text-black";
    case "BEGINNING":
      return "text-white";
    case "ENDING":
      return "text-white";
    case "WAITING":
      return "text-white";
    case "PROCESSING":
      return "text-black";
    case "VETOING":
      return "text-black";
    case "SETUP":
      return "text-black";
    default:
      return "text-white";
  }
}
export function getStatusColor(status: string | undefined): string {
  switch (status) {
    case undefined:
    case "UNKNOWN":
      return "bg-[#F08080]";
    case "PAUSED":
      return "bg-red-500";
    case "PAUSING":
      return "bg-red-950";
    case "RESUMING":
      return "bg-green-900";
    case "RUNNING":
      return "bg-[#90EE90]";
    case "BEGINNING":
      return "bg-[#90EE90]";
    case "ENDING":
      return "bg-[#90EE90]";
    case "WAITING":
      return "bg-[#DAA520]";
    case "PROCESSING":
      return "bg-[#FFFF00]";
    case "VETOING":
      return "bg-[#FFFF00]";
    case "SETUP":
      return "bg-[#ADD8E6]";
    default:
      return "bg-gray-500";
  }
}
