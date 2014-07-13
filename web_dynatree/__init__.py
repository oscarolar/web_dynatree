#flake8: noqa
versions = ['7.0', '8.0']
from openerp.release import major_version
if major_version not in versions:
    raise Exception("This module is only for %s major version of OpenERP"
                    % (versions,))

import controllers
import base
