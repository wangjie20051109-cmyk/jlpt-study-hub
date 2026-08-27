import asyncio, json, os
import edge_tts

VOICE='ja-JP-NanamiNeural'
RATE='-8%'

async def one(task):
    path=task['file']
    if os.path.exists(path) and os.path.getsize(path)>2048:
        return False
    os.makedirs(os.path.dirname(path),exist_ok=True)
    communicate=edge_tts.Communicate(task['text'],VOICE,rate=RATE)
    await communicate.save(path)
    print('generated',path)
    return True

async def main():
    with open('audio_tasks.json','r',encoding='utf-8') as f: tasks=json.load(f)
    for i,t in enumerate(tasks,1):
        print(f'[{i}/{len(tasks)}] {t["kind"]} {t["level"]} {t["title"]}')
        await one(t)

asyncio.run(main())
