<?php

/**
 * @license LGPLv3, http://opensource.org/licenses/LGPL-3.0
 * @copyright Aimeos (aimeos.org), 2017-2021
 */

$enc = $this->encoder();

?>

<div class="chart order-salesweekday col-xl-6">
	<div class="card">
		<div id="order-salesweekday-head" class="card-header header" role="tab"
			data-bs-toggle="collapse" data-target="#order-salesweekday-data"
			aria-expanded="true" aria-controls="order-salesweekday-data">
			<div class="card-tools-left">
				<div class="btn btn-card-header act-show fa"></div>
			</div>
			<span class="item-label header-label">
				<?= $enc->html( $this->translate( 'admin', 'Sales by weekday' ) ); ?>
			</span>
		</div>
		<div id="order-salesweekday-data" class="card-block collapse show content loading" role="tabpanel"
			aria-labelledby="order-salesweekday-head">
		</div>
	</div>
</div>
<?= $this->get( 'orderweekdayBody' ); ?>
