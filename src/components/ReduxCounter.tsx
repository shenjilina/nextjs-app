"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from "@/types/redux";
import { decremented, incremented, added, reset } from "@/features/counter/counterSlice";

export default function ReduxCounter() {
  const value = useAppSelector((s) => s.counter.value);
  const dispatch = useAppDispatch();

  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle>Redux Counter 示例</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        <div className="mt-2 text-sm text-muted-foreground">通过 dispatch action 更新全局 state</div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={() => dispatch(decremented())} variant="secondary">
          -1
        </Button>
        <Button onClick={() => dispatch(incremented())}>+1</Button>
        <Button onClick={() => dispatch(added(5))} variant="secondary">
          +5
        </Button>
        <Button onClick={() => dispatch(reset())} variant="ghost">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
