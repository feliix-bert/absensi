-- Fix historical attendance statuses that were incorrectly marked as 'Hadir' 
-- due to UTC hour evaluation on the server.
-- This sets status to 'Terlambat' for any check_in that occurred at or after 09:00:00 WIB.

UPDATE public.attendance
SET status = 'Terlambat'
WHERE EXTRACT(HOUR FROM check_in AT TIME ZONE 'Asia/Jakarta') >= 9
  AND status = 'Hadir';
