import asyncio, json, os, random
import edge_tts

VOICE='ja-JP-NanamiNeural'
RATE='-8%'
CONCURRENCY=5
RETRIES=3

sem=asyncio.Semaphore(CONCURRENCY)

async def one(task, index, total):
    path=task['file']
    if os.path.exists(path) and os.path.getsize(path)>2048:
        print(f'[{index}/{total}] cached {path}')
        return False
    os.makedirs(os.path.dirname(path),exist_ok=True)
    async with sem:
        for attempt in range(1,RETRIES+1):
            try:
                print(f'[{index}/{total}] generating {task["kind"]} {task["level"]} {task["title"]} (try {attempt})')
                communicate=edge_tts.Communicate(task['text'],VOICE,rate=RATE)
                await communicate.save(path)
                if os.path.exists(path) and os.path.getsize(path)>2048:
                    return True
                raise RuntimeError('audio file too small')
            except Exception as e:
                if attempt>=RETRIES:
                    print('FAILED',path,repr(e))
                    raise
                await asyncio.sleep(1.5*attempt+random.random())
    return False

async def main():
    with open('audio_tasks.json','r',encoding='utf-8') as f:
        tasks=json.load(f)
    pending=[(i,t) for i,t in enumerate(tasks,1) if not (os.path.exists(t['file']) and os.path.getsize(t['file'])>2048)]
    print(f'{len(tasks)} total tasks; {len(pending)} need generation; concurrency={CONCURRENCY}')
    if not pending:
        return
    await asyncio.gather(*(one(t,i,len(tasks)) for i,t in pending))

asyncio.run(main())
