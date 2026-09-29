import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();

    const formattedTasks = tasks.map((task: any) => ({
      title: task.title || '',
      status: task.status || '',
      start_time: task.start_time || '',
      end_time: task.end_time || '',
      duration: task.duration || '',
      notes: Array.isArray(task.notes) ? task.notes.join(' | ') : (task.notes || '')
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedTasks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Krimsona_Log');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `Krimsona_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
