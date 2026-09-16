import './style.css';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Existing app content is preserved; this small event hook lets the Coffee Journal
// offer a post-brew log prompt when a guided brew reaches completion.
const originalAdvanceGuideMarker = "notify('Brew complete');renderGuide();";
