const data = {
  flame_all: {
    height: 23,
    num: 2742,
    tree: {
      '0x497ca0': [
        {
          __libc_start_main: [
            {
              Py_Main: [
                {
                  PyRun_SimpleFileExFlags: [
                    {
                      PyRun_FileExFlags: [
                        {
                          'run_mod.lto_priv.2028': [
                            {
                              'cron.py:<module>:4': [
                                {
                                  'cron.py:main:11': [
                                    {
                                      '/usr/lib/python2.7/logging/__init__.py:info:1616':
                                        [
                                          {
                                            'function_call.lto_priv.291': [
                                              {
                                                '/usr/lib/python2.7/logging/__init__.py:RootLogger.info:1150':
                                                  [
                                                    {
                                                      'function_call.lto_priv.291':
                                                        [
                                                          {
                                                            '/usr/lib/python2.7/logging/__init__.py:RootLogger._log:1260':
                                                              [
                                                                {
                                                                  '/usr/lib/python2.7/logging/__init__.py:RootLogger.makeRecord:1247':
                                                                    [
                                                                      {
                                                                        'type_call.lto_priv.90':
                                                                          [
                                                                            {
                                                                              'slot_tp_init.lto_priv.1152':
                                                                                [
                                                                                  {
                                                                                    'instancemethod_call.lto_priv.210':
                                                                                      [
                                                                                        {
                                                                                          'function_call.lto_priv.291':
                                                                                            [
                                                                                              {
                                                                                                '/usr/lib/python2.7/logging/__init__.py:LogRecord.__init__:243':
                                                                                                  [
                                                                                                    {
                                                                                                      PyObject_SetAttr:
                                                                                                        [
                                                                                                          {
                                                                                                            PyObject_GenericSetAttr:
                                                                                                              [
                                                                                                                {
                                                                                                                  'dictresize.lto_priv.1412':
                                                                                                                    [
                                                                                                                      {
                                                                                                                        __libc_malloc:
                                                                                                                          [
                                                                                                                            {},
                                                                                                                            1,
                                                                                                                          ],
                                                                                                                      },
                                                                                                                      1,
                                                                                                                    ],
                                                                                                                },
                                                                                                                1,
                                                                                                              ],
                                                                                                          },
                                                                                                          1,
                                                                                                        ],
                                                                                                    },
                                                                                                    1,
                                                                                                  ],
                                                                                              },
                                                                                              1,
                                                                                            ],
                                                                                        },
                                                                                        1,
                                                                                      ],
                                                                                  },
                                                                                  1,
                                                                                ],
                                                                            },
                                                                            1,
                                                                          ],
                                                                      },
                                                                      1,
                                                                    ],
                                                                },
                                                                1,
                                                              ],
                                                          },
                                                          1,
                                                        ],
                                                    },
                                                    1,
                                                  ],
                                              },
                                              1,
                                            ],
                                          },
                                          1,
                                        ],
                                    },
                                    1,
                                  ],
                                  'time_sleep.lto_priv.2646': [
                                    {
                                      __select: [{}, 4],
                                    },
                                    6,
                                  ],
                                  'time_sleep.xxxxxx': [
                                    {
                                      __select: [{}, 2],
                                    },
                                    2,
                                  ],
                                },
                                10,
                              ],
                            },
                            20,
                          ],
                        },
                        30,
                      ],
                    },
                    40,
                  ],
                },
                70,
              ],
            },
            80,
          ],
        },
        100,
      ],
    },
  },
  flame_vm: {
    height: 7,
    num: 2742,
    tree: {
      'cron.py:<module>:4': [
        {
          'cron.py:main:11': [
            {
              '/usr/lib/python2.7/logging/__init__.py:info:1616': [
                {
                  '/usr/lib/python2.7/logging/__init__.py:RootLogger.info:1150':
                    [
                      {
                        '/usr/lib/python2.7/logging/__init__.py:RootLogger._log:1260':
                          [
                            {
                              '/usr/lib/python2.7/logging/__init__.py:RootLogger.makeRecord:1247':
                                [
                                  {
                                    '/usr/lib/python2.7/logging/__init__.py:LogRecord.__init__:243':
                                      [{}, 1],
                                  },
                                  1,
                                ],
                            },
                            1,
                          ],
                      },
                      1,
                    ],
                },
                1,
              ],
            },
            1,
          ],
        },
        2742,
      ],
    },
  },
};

export default data
