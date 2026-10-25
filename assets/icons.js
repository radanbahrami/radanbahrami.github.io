import {
  createIcons,
  ArrowLeft,
  Brain,
  Briefcase,
  Check,
  ChevronDown,
  Code,
  Code2,
  Copy,
  Database,
  Globe,
  Info,
  Lock,
  Mail,
  MessageSquare,
  PencilLine,
  Rocket,
  ShoppingCart,
} from "https://unpkg.com/lucide@0.544.0/dist/esm/lucide.js";

createIcons({
  icons: {
    ArrowLeft,
    Brain,
    Briefcase,
    Check,
    ChevronDown,
    Code,
    Code2,
    Copy,
    Database,
    Globe,
    Info,
    Lock,
    Mail,
    MessageSquare,
    PencilLine,
    Rocket,
    ShoppingCart,
  },
});

if (typeof window.prepCheckPaths === "function") window.prepCheckPaths();
