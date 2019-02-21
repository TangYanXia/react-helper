const markStatusStack = [];

export default function markStatus(loadingStatusName) {
  markStatusStack[markStatusStack.length - 1].push(loadingStatusName);
}

function pushRunningStack(frame = []) {
  const currentFrame = frame;
  markStatusStack.push(currentFrame);
  return currentFrame;
}

function popRunningStack() {
  markStatusStack.pop();
}

export function addLifecycle(gen, {
  onAddStatus, onOk, onError, onYield
}) {
  return function* generatedFunction(...args) {
    let currentFrame = pushRunningStack();
    try {
      const it = gen(...args);
      let val;
      let nextAction = 'next';
      while (true) {
        const frameSnapshot = [...currentFrame];
        const { done, value } = it[nextAction](val);
        nextAction = 'next';
        if (done) {
          currentFrame = frameSnapshot;
          break;
        }
        try {
          const addedStatus = currentFrame.slice(frameSnapshot.length);
          if (addedStatus.length) {
            yield onAddStatus(addedStatus);
          }
          popRunningStack();
          val = yield onYield(value);
        } catch (e) {
          nextAction = 'throw';
          val = e;
        }
        pushRunningStack(currentFrame);
      }
      if (currentFrame.length) {
        yield onOk(currentFrame);
      }
    } catch (e) {
      if (currentFrame.length) {
        yield onError(currentFrame);
      }
      throw e;
    } finally {
      popRunningStack();
    }
  };
}
