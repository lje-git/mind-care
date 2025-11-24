import { createClient } from '@supabase/supabase-js';

// 1. 환경 변수(비밀 금고)에서 주소와 열쇠를 가져옵니다.
// (느낌표 !는 "이 값은 무조건 있어!"라고 컴퓨터를 안심시키는 표시입니다)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. Supabase와 연결할 수 있는 도구를 만들어서 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseKey);