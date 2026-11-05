package com.backend.service;

import com.backend.dao.ContainerDao;
import com.backend.model.Container;
import com.backend.runtime.Runtime;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ContainerServiceTest {

    @Test
    void restartStopsRunningContainerBeforeStartingItAgain() {
        ContainerDao dao = mock(ContainerDao.class);
        Runtime runtime = mock(Runtime.class);
        Container container = container();
        when(dao.findById(7L)).thenReturn(container);
        when(runtime.getContainerStatus("container-7")).thenReturn("running");

        new ContainerService(dao, runtime).restartContainer(7L);

        InOrder order = inOrder(runtime, dao);
        order.verify(runtime).stopContainer("container-7");
        order.verify(dao).markStopped(org.mockito.ArgumentMatchers.eq(7L),
                org.mockito.ArgumentMatchers.any());
        order.verify(runtime).startContainer("container-7");
        order.verify(dao).markStarted(org.mockito.ArgumentMatchers.eq(7L),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void restartStartsStoppedContainerWithoutTryingToStopIt() {
        ContainerDao dao = mock(ContainerDao.class);
        Runtime runtime = mock(Runtime.class);
        when(dao.findById(7L)).thenReturn(container());
        when(runtime.getContainerStatus("container-7")).thenReturn("exited");

        new ContainerService(dao, runtime).restartContainer(7L);

        verify(runtime).startContainer("container-7");
        verify(runtime, org.mockito.Mockito.never()).stopContainer("container-7");
    }

    private Container container() {
        Container container = new Container();
        container.setId(7L);
        container.setDockerContainerId("container-7");
        container.setStatus("RUNNING");
        return container;
    }
}
