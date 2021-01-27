/**
 * @license LGPLv3, http://opensource.org/licenses/LGPL-3.0
 * @copyright Aimeos (aimeos.org), 2015-2018
 */



Aimeos = {

	options: null,
	components: {},

	editorcfg : [
		{ name: 'clipboard', items: [ 'Undo', 'Redo' ] },
		{ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat' ] },
		{ name: 'insert', items: [ 'SpecialChar' ] },
		{ name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote' ] },
		{ name: 'document', items: [ 'Source' ] }
	],

	editortags : 'div(*);span(*);p(*);',

	editorExtraPlugins: 'divarea',

	editorRemoveButtons: 'Underline,Subscript,Superscript',

	flatpickr : {
		datetimerange: {
			altInput: true,
			defaultDate: null,
			defaultHour: 0,
			enableTime: true,
			locale: {
				rangeSeparator: ' - '
			},
			mode: "range",
			plugins: [new confirmDatePlugin({})],
			position: 'below',
			time_24hr: true,
			wrap: false
		},
		datetime: {
			altInput: true,
			// altFormat: 'M j, Y H:i K',
			defaultDate: null,
			defaultHour: 0,
			enableTime: true,
			plugins: [new confirmDatePlugin({})],
			position: 'below',
			time_24hr: true,
			wrap: false
		},
		daterange: {
			altInput: true,
			defaultDate: null,
			locale: {
				rangeSeparator: ' - '
			},
			mode: "range",
			position: 'below',
			wrap: false
		},
		date: {
			altInput: true,
			// altFormat: 'M j, Y',
			defaultDate: null,
			position: 'below',
			wrap: false
		},
		time: {
			altInput: true,
			defaultHour: 0,
			enableTime: true,
			time_24hr: true,
			position: 'below',
			wrap: false
		}
	},

	addClone : function(node, getfcn, selectfn, after) {

		var clone = node.clone().removeClass("prototype");
		var combo = $(".combobox-prototype", clone);

		combo.combobox({getfcn: getfcn, select: selectfn});
		combo.removeClass("combobox-prototype");
		combo.addClass("combobox");

		$("[disabled='disabled']", clone).prop("disabled", false);

		if(typeof Modernizr != 'undefined') {
			if(!Modernizr.inputtypes['datetime-local']) {
				$("input[type='datetime-local']", clone).each(function(idx, elem) {
					$(elem).datepicker({
						dateFormat: 'yy-mm-dd',
						constrainInput: false
					});
				});
			}

			if(!Modernizr.inputtypes['date']) {
				$("input[type='date']", clone).each(function(idx, elem) {
					$(elem).datepicker({
						dateFormat: 'yy-mm-dd',
						constrainInput: false
					});
				});
			}
		}

		if(after) {
			clone.insertAfter(node);
		} else {
			clone.insertBefore(node);
		}

		return clone;
	},


	focusBefore : function(node) {

		var elem = $(":focus", node);
		var elements = $(".aimeos [tabindex=" + elem.attr("tabindex") + "]:visible");
		var idx = elements.index(elem) - $("[tabindex=" + elem.attr("tabindex") + "]:visible", node).length;

		if(idx > -1) {
			elements[idx].focus();
		}

		return node;
	},


	getCountries : function(request, response, element) {

		if(request.term.length == 0) {
			var url = 'https://restcountries.eu/rest/v2/all';
		} else if(request.term.length > 1) {
			var url = 'https://restcountries.eu/rest/v2/name/' + request.term;
		} else {
			return;
		}

		$.ajax({
			url: url,
			dataType: "json",
			data: 'fields=alpha2Code;name',
			success: function(result) {
				var list = result || [];

				$("option", element).remove();

				response( list.map(function(obj) {

					var opt = $("<option/>");

					opt.attr("value", obj.alpha2Code);
					opt.text(obj.alpha2Code);
					opt.appendTo(element);

					return {
						label: obj.name || obj.alpha2Code,
						value: obj.alpha2Code,
						option: opt
					};
				}));
			}
		});

	},


	getOptions : function(request, response, element, domain, key, sort, criteria, labelFcn) {

		Aimeos.options.done(function(data) {

			var compare = {}, field = {}, list = {}, params = {}, param = {};

			compare[key] = request.term;
			list = criteria ? [{'=~': compare}, criteria] : [{'=~': compare}];

			param['filter'] = {'&&': list};
			param['fields'] = field;
			param['sort'] = sort;

			if( data.meta && data.meta.prefix ) {
				params[data.meta.prefix] = param;
			} else {
				params = param;
			}

			$.ajax({
				dataType: "json",
				url: data.meta.resources[domain] || null,
				data: params,
				success: function(result) {
					var list = result.data || [];

					if(!labelFcn) {
						labelFcn = function(attr) {
							return attr[key] || null;
						}
					}

					$("option", element).remove();

					response( list.map(function(obj) {

						var opt = $("<option/>");

						opt.attr("value", obj.id);
						opt.text(labelFcn(obj.attributes));
						opt.appendTo(element);

						return {
							label: labelFcn(obj.attributes),
							value: obj.id,
							option: opt
						};
					}));
				}
			});
		});
	},


	getOptionsAttributes : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'attribute', 'attribute.label', 'attribute.label', criteria, labelFcn);
	},


	getOptionsCategories : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'catalog', 'catalog.label', 'catalog.label', criteria, labelFcn);
	},


	getOptionsCustomers : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'customer', 'customer.code', 'customer.code', criteria, labelFcn);
	},


	getOptionsCurrencies : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'locale/currency', 'locale.currency.id', '-locale.currency.status,locale.currency.id', criteria, labelFcn);
	},


	getOptionsLanguages : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'locale/language', 'locale.language.id', '-locale.language.status,locale.language.id', criteria, labelFcn);
	},


	getOptionsSites : function(request, response, element, criteria, labelFcn) {
		Aimeos.getOptions(request, response, element, 'locale/site', 'locale.site.label', '-locale.site.status,locale.site.label', criteria, labelFcn);
	},


	getOptionsProducts : function(request, response, element, criteria) {
		Aimeos.getOptions(request, response, element, 'product', 'product.label', 'product.label', criteria);
	},


	lazy : function(selector, renderFcn) {

		if('IntersectionObserver' in window) {

			let callback = function(entries, observer) {
				for(let entry of entries) {
					if(entry.isIntersecting) {
						observer.unobserve(entry.target);
						renderFcn();
					}
				};
			};

			$(selector).each(function() {
				(new IntersectionObserver(callback, {})).observe(this);
			});

		} else if($(selector).length) {
			renderFcn();
		}
	}
};



Aimeos.Config = {

	init : function() {

		this.addConfigLine();
		this.deleteConfigLine();
		this.configComplete();

		this.addConfigMapLine();
		this.deleteConfigMapLine();
		this.hideConfigMap();
		this.showConfigMap();
	},


	setup : function(resource, provider, target, type) {

		if(!provider) {
			return;
		}

		Aimeos.options.done(function(data) {

			if(!data.meta || !data.meta.resources || !data.meta.resources[resource]) {
				return;
			}

			var params = {}, param = {id: provider};

			if(type) {
				param["type"] = type;
			}

			if(data.meta && data.meta.prefix) {
				params[data.meta.prefix] = param;
			} else {
				params = param;
			}

			$.ajax({
				url: data.meta.resources[resource],
				dataType: "json",
				data: params
			}).done(function(result) {

				$(result.data).each(function(idx, entry) {
					var nodes = $("table.item-config input.config-key", target);
					var node = null;
					var value = '';

					nodes.each(function() {
						if($(this).val() === entry.id) {
							node = $(this);
						}
					})

					if(node) {
						var el = $("table.item-config .config-item.prototype .config-type-" + entry.attributes.type, target).clone();
						var row = node.closest(".config-item");
						var valnode = $(".config-value", row);
						value = valnode.val();

						$("> [disabled='disabled']", el).prop("disabled", false);
						$("> input", el).val(value);
						el.prop("disabled", false);
						el.val(value);
						valnode.remove();

						$(".help-text", row).text(entry.attributes.label);
						$(".config-row-value", row).append(el);
					} else {
						var row = Aimeos.addClone($("table.item-config .config-item.prototype", target));

						$(".config-row-value .config-type:not(.config-type-" + entry.attributes.type + ")", row).remove();
						$(".config-row-key .help-text", row).text(entry.attributes.label);
						$(".config-value", row).val(entry.attributes.default);
						$(".config-key", row).val(entry.id);
					}

					if(entry.attributes.type === 'select') {
						$.each(entry.attributes.default, function(idx, label) {
							var opt = $('<option/>');
							opt.text(label);
							if(value === label) {
								opt.prop('selected', true);
							}
							$(".config-value", row).append(opt);
						});
					}

					if(!entry.attributes.required) {
						$(".config-value", row).prop("required", false);
						row.removeClass("mandatory");
					} else {
						$(".config-value", row).prop("required", true);
						row.addClass("mandatory");
					}
				});
			});
		});
	},


	addConfigLine : function() {

		$(".aimeos .item .tab-pane").on("click", ".item-config .actions .act-add", function(ev) {

			var node = $(this).closest(".item-config");
			var clone = Aimeos.addClone($(".prototype", node));
			var types = $(".config-type", clone);

			var count = $(".group-item:not(.prototype)", $(this).closest(".tab-pane")).length;

			if(count === 0) {
				count = $(".list-item-new", ev.delegateTarget).length - 2; // minus prototype and must start with 0
			} else {
				count -= 1; // minus already added block
			}

			if(types.length > 0 ) {
				$(".config-type:not(.config-type-string)", clone).remove();
			}

			$("input", clone).each(function() {
				$(this).attr("name", $(this).attr("name").replace("idx", count));
			});

			$(".config-key", clone).autocomplete({
				source: node.data("keys") || [],
				minLength: 0,
				delay: 0
			});
		});
	},


	deleteConfigLine : function() {

		$(".aimeos .item .tab-pane").on("click", ".item-config .config-item .actions .act-delete", function(ev) {
			Aimeos.focusBefore($(this).closest("tr")).remove();
		});
	},


	configComplete : function() {

		var node = $(".aimeos .item-config");
		$(".config-item .config-key", node).autocomplete({
			source: node.data("keys") || [],
			minLength: 0,
			delay: 0
		});

		$(".aimeos .item").on("click", " .config-key", function(ev) {
			$(this).autocomplete("search", "");
		});
	},


	addConfigMapLine : function() {

		$(".aimeos .item-config").on("click", ".config-map-table .config-map-actions .act-add", function(ev) {

			var node = $(this).closest(".config-map-table");
			var clone = Aimeos.addClone($(".prototype-map", node));

			clone.removeClass("prototype-map");
			$(".act-delete", clone).focus();

			return false;
		});
	},


	deleteConfigMapLine : function() {

		$(".aimeos .item-config").on("click", ".config-map-table .config-map-actions .act-delete", function(ev) {
			Aimeos.focusBefore($(this).closest("tr")).remove();
		});
	},


	hideConfigMap : function() {

		$(".aimeos .item-config").on("click", ".config-map-table .config-map-actions .act-update", function(ev) {

			var obj = {};
			var table = $(this).closest(".config-map-table");
			var lines = $(".config-map-row:not(.prototype-map)", table)

			lines.each(function() {
				obj[ $("input.config-map-key", this).val() ] = $("input.config-map-value", this).val();
			});

			$(".config-value", table.parent()).val(JSON.stringify(obj));

			table.hide();
			lines.remove();

			return false;
		});
	},


	showConfigMap : function() {

		$(".aimeos .item-config").on("focus", ".config-value", function() {

			var table = $(".config-map-table", $(this).parent());

			if(table.is(":visible")) {
				return false;
			}

			try {
				var obj = JSON.parse($(this).val())
			} catch(e) {
				var obj = {};
			}

			for(var key in obj) {
				var clone = Aimeos.addClone($(".prototype-map", table));
				$(".config-map-value", clone).val(obj[key]);
				$(".config-map-key", clone).val(key);
				clone.removeClass("prototype-map");
			}

			table.show();
		});
	}
};



Aimeos.Form = {

	init : function() {

		this.checkFields();
		this.checkSubmit();
		this.editFields();
		this.setupNext();
		this.showErrors();
		this.toggleHelp();
	},


	checkFields : function() {

		$(".aimeos .item-content .readonly").on("change", "input,select", function(ev) {
			$(this).addClass("is-invalid");
		});


		$(".aimeos .item-content").on("blur", "input,select", function(ev) {

			if($(this).closest(".readonly").length > 0 || $(this).hasClass("novalidate")) {
				return;
			}

			if($(this).is(":invalid") === true) {
				$(this).removeClass("is-valid").addClass("is-invalid");
			} else {
				$(this).removeClass("is-invalid").addClass("is-valid");
			}
		});
	},


	checkSubmit : function() {

		$(".aimeos form").each(function() {
			this.noValidate = true;
		});

		$(".aimeos form").on("submit", function(ev) {
			var nodes = [];

			$(".card-header", this).removeClass("is-invalid");
			$(".item-navbar .nav-link", this).removeClass("is-invalid");

			$(".item-content input,select", this).each(function(idx, element) {
				var elem = $(element);

				if(elem.closest(".prototype").length === 0 && elem.is(":invalid") === true) {
					if(!elem.hasClass('.form-control')) {
						elem = elem.closest('.form-control');
					}
					nodes.push(elem.addClass("is-invalid"));
				} else {
					elem.removeClass("is-invalid");
				}
			});

			$(".item-content td.is-invalid", this).each(function(idx, element) {
				nodes.push(element);
			});

			$.each(nodes, function() {
				$(".card-header", $(this).closest(".card")).addClass("is-invalid");

				$(this).closest(".tab-pane").each(function() {
					$(".item-navbar .nav-item." + $(this).attr("id") + " .nav-link").addClass("is-invalid");
				});
			});

			if( nodes.length > 0 ) {
				$('html, body').animate({
					scrollTop: '0px'
				});

				return false;
			}

			if($("input,select").length > $("#problem .max_input_vars").data("value")) {
				$("#problem .max_input_vars").show();
				$("#problem").modal("show");
				return false;
			}
		});
	},


	editFields : function() {

		$(".aimeos .list-item").on("click", ".act-edit", function(ev) {
			$("[disabled=disabled]", ev.delegateTarget).removeAttr("disabled");
			return false;
		});
	},


	setupNext : function() {

		$(".aimeos .item").on("click", ".next-action", function(ev) {
			$("#item-next", ev.delegateTarget).val($(this).data('next'));
			$(ev.delegateTarget).submit();
			return false;
		});
	},


	showErrors : function() {

		$(".aimeos .error-list .error-item").each(function() {
			$(".aimeos ." + $(this).data("key") + " .header").addClass("is-invalid");
		});
	},


	toggleHelp : function() {

		$(".aimeos").on("click", ".help", function(ev) {
			var list = $(this).closest("table.item-config");

			if( list.length === 0 ) {
				list = $(this).parent();
			}

			$(".help-text", list).slideToggle(300);
		});

		$(".aimeos").on("click", ".act-help", function(ev) {
			$(".help-text", ev.delegateTarget).slideToggle(300);
		});
	}
};



Aimeos.List = {

	instance : null,


	init : function() {

		let node = document.querySelector(".list-view");
		if(node) {
			this.instance = new Vue({el: node, mixins: [this.mixins]});
		}
	},


	mixins : {
		data: function() {
			return {
				'all': false,
				'dialog': false,
				'items': {},
				'domain': null,
				'search': false
			}
		},
		beforeMount: function() {
			if(this.$el.dataset) {
				if(this.$el.dataset.items) {
					this.items = JSON.parse(this.$el.dataset.items);
				}
				if(this.$el.dataset.domain) {
					this.domain = this.$el.dataset.domain;
				}
			}
		},
		computed: {
			unconfirmed: function() {
				let list = {};

				for(const key in this.items) {
					if(this.items[key].checked) {
						list[key] = this.items[key][this.domain + '.label'];
					}
				}

				return list;
			}
		},
		methods: {
			askDelete: function(id) {
				if(id) {
					this.reset(false);
					this.$set(this.items[id], 'checked', true);
				}

				this.dialog = true;
			},

			confirmDelete: function(val) {
				if(val) {
					if(this.$refs.form && this.$refs.form.dataset && this.$refs.form.dataset.deleteurl) {
						this.$refs.form.action = this.$refs.form.dataset.deleteurl;
						this.$refs.form.submit();
					} else {
						console.log('[Aimeos] Missing form reference or data-deleteurl');
					}
				}

				if(Object.keys(this.unconfirmed).length === 1) {
					this.reset(false);
				}

				this.dialog = false;
			},

			reset: function(val) {
				this.all = val;
				for(const key in this.items) {
					this.$set(this.items[key], 'checked', val);
				};
			},

			toggle: function(id) {
				this.$set(this.items[id], 'checked', !this.items[id].checked);
			},

			toggleAll: function() {
				this.reset(this.all = !this.all);
			}
		}
	},


	confirmDelete : function() {

		$("#confirm-delete").on("click", ".btn-danger", function(e) {

			if($(this).data("multi")) {
				var form = $("form.list");
				form.attr('action', $(this).data('url'));
				form.submit();
			} else if($(this).data("url")) {
				window.location = $(this).data("url");
			}

			return false;
		});
	}
};



Aimeos.Msg = {

	init : function() {

		this.fadeInfo();
	},


	fadeInfo : function() {
		$(".info-list.alert").delay(2500).slideUp();
	}
};



Aimeos.Nav = {

	init : function() {

		this.addShortcuts();
		this.hoverMenu();
		this.toggleFormItems();
		this.toggleNavItems();
		this.toggleMenu();
		this.toggleNavItemsTexts();
		this.toggleSearch();
	},


	addShortcuts : function() {

		$(document).bind('keydown', function(ev) {
			if(ev.ctrlKey || ev.metaKey) {
				var key = String.fromCharCode(ev.which).toLowerCase();

				if(ev.altKey) {
					if(key.match(/[a-z]/)) {
						var link = $(".aimeos .sidebar-menu a[data-ctrlkey=" + key + "]").first();

						if(link.length) {
							window.location = link.attr("href");
						}
					}
				}
				switch(key) {
					case 'i':
						var node = $(".aimeos :focus").closest(".card,.content-block").find(".act-add:visible").first();
						if(node.length > 0) {
							node.trigger("click");
							return false;
						}

						node = $(".aimeos .act-add:visible").first();
						if(node.attr("href")) {
							window.location = node.attr('href');
						} else {
							node.trigger("click");
							return false;
						}
					case 'd':
						var node = $(".aimeos .act-copy:visible").first();
						if(node.attr("href")) {
							window.location = node.attr('href');
						} else {
							node.trigger("click");
							return false;
						}
					case 's':
						$(".aimeos form.item").first().submit();
						return false;
				}
			} else if(ev.which === 13) {
				$(".btn:focus").trigger("click");
			}
		});
	},


	hoverMenu : function() {

		document.querySelectorAll(".aimeos .main-sidebar .sidebar-menu li").forEach(function(item) {
			item.addEventListener("mouseenter", function(ev) {
				if(item !== active && ev.target.previousElementSibling) {
					ev.target.previousElementSibling.classList.add("before");
				}
				if(item !== active && ev.target.nextElementSibling) {
					ev.target.nextElementSibling.classList.add("after");
				}
			});
			item.addEventListener("mouseleave", function(ev) {
				if(item !== active && ev.target.previousElementSibling) {
					ev.target.previousElementSibling.classList.remove("before");
				}
				if(item !== active && ev.target.nextElementSibling) {
					ev.target.nextElementSibling.classList.remove("after");
				}
			});
		});
	},


	toggleMenu : function() {

		if(window.sessionStorage && window.sessionStorage.getItem('aimeos/jqadm/sidebar') == 1) {
			$(".aimeos .main-sidebar .separator .more").removeClass("more").addClass("less");
			$(".aimeos .main-sidebar .advanced").show();
		}

		$(".aimeos .main-sidebar").on("click", ".separator .more", function(ev) {
			$(".advanced", ev.delegateTarget).slideDown(300, function() {
				$(ev.currentTarget).removeClass("more").addClass("less");
				if(window.sessionStorage) {
					window.sessionStorage.setItem('aimeos/jqadm/sidebar', 1);
				}
			});
		});

		$(".aimeos .main-sidebar").on("click", ".separator .less", function(ev) {
			$(".advanced", ev.delegateTarget).slideUp(300, function() {
				$(ev.currentTarget).removeClass("less").addClass("more");
				if(window.sessionStorage) {
					window.sessionStorage.setItem('aimeos/jqadm/sidebar', 0);
				}
			});
		});
	},


	toggleNavItems : function() {

		if(window.sessionStorage && window.sessionStorage.getItem('aimeos/jqadm/item/navbar') == 1) {
			$(".aimeos .item-navbar .navbar-content .more").removeClass("more").addClass("less");
			$(".aimeos .item-navbar .navbar-content").addClass("show");
		}

		$(".aimeos .item-navbar .navbar-content").on("click", ".more", function(ev) {
			if(window.sessionStorage) {
				window.sessionStorage.setItem('aimeos/jqadm/item/navbar', 1);
			}
			$(ev.currentTarget).removeClass("more").addClass("less");
			$(ev.delegateTarget).addClass("show");
		});

		$(".aimeos .item-navbar .navbar-content").on("click", ".less", function(ev) {
			if(window.sessionStorage) {
				window.sessionStorage.setItem('aimeos/jqadm/item/navbar', 0);
			}
			$(ev.currentTarget).removeClass("less").addClass("more");
			$(ev.delegateTarget).removeClass("show");
		});
	},


	toggleFormItems : function() {

		if(window.sessionStorage && window.sessionStorage.getItem('aimeos/jqadm/item/form') == 1) {
			$(".aimeos .item-content .separator .more").removeClass("more").addClass("less");
			$(".aimeos .item-content .form-group.advanced").css("display", "flex");
		}

		$(".aimeos .item-content").on("click", ".separator .more", function(ev) {
			$(".form-group.advanced", ev.delegateTarget).css("display", "flex");
			$(ev.currentTarget).removeClass("more").addClass("less");
			if(window.sessionStorage) {
				window.sessionStorage.setItem('aimeos/jqadm/item/form', 1);
			}
		});

		$(".aimeos .item-content").on("click", ".separator .less", function(ev) {
			$(".form-group.advanced", ev.delegateTarget).css("display", "none");
			$(ev.currentTarget).removeClass("less").addClass("more");
			if(window.sessionStorage) {
				window.sessionStorage.setItem('aimeos/jqadm/item/form', 0);
			}
		});
	},


	toggleNavItemsTexts : function() {

		$('#js--toggle-nav-items-text').on('click', function() {
			document.body.classList.toggle('js--show-nav-items-texts');
		})
	},


	toggleSearch : function() {

		$('#js--toggle-search').on('click', function() {
			document.body.classList.toggle('js--show-search');
		})
	},
};



Aimeos.Tabs = {

	init : function() {

		this.setPanelHeight();
		this.setupTabSwitch();
	},


	setPanelHeight : function() {

		$(".aimeos .tab-pane").on("click", ".filter-columns", function(ev) {
			// CSS class "show" will be added afterwards, thus it's reversed
			var height = ($(this).hasClass("show") ? 0 : $(".dropdown-menu", this).outerHeight());
			$(ev.delegateTarget).css("min-height", $("thead", ev.delegateTarget).outerHeight() + height);
		});
	},


	setupTabSwitch : function() {

		var hash = '';
		var url = document.location.toString();

		if(url.match(/#[a-z0-9]+/i)) {
			hash = url.split('#')[1];
			$('.nav-tabs a[href="#' + hash + '"]').tab('show');

			$("form").each(function() {
				$(this).attr("action", $(this).attr("action").split('#')[0] + '#' + hash);
			});
		}

		$('.nav-tabs a').on('shown.bs.tab', function (e) {
			hash = e.target.hash;

			if(history.pushState) {
				history.pushState(null, null, hash);
			} else {
				window.location.hash = hash;
				window.scrollTo(0, 0);
			}

			$("form").each(function() {
				$(this).attr("action", $(this).attr("action").split('#')[0] + hash);
			});
		})
	}
};



Aimeos.Log = {

	time : null,


	init : function() {

		this.toggleItem();
	},


	toggleItem : function() {

		$(".aimeos .list-log .log-message").on("mousedown", function(ev) {
			this.time = (new Date()).getTime();
		});

		$(".aimeos .list-log .log-message").on("mouseup", function(ev) {
			var el = $(this);

			if(this.time < (new Date()).getTime() - 500) {
				return false;
			}

			if(el.hasClass("show")) {
				el.removeClass("show");
			} else {
				el.addClass("show");
			}

			return false;
		});
	}
}


Aimeos.Menu = {
	init: function() {
		$(".app-menu").on("click", ".menu", function(ev) {
			$(".main-sidebar").addClass("open");
			$(this).addClass("open");
		});

		$(".app-menu").on("click", ".menu.open", function(ev) {
			$(".main-sidebar").removeClass("open");
			$(this).removeClass("open");
		});
	}
}



$(function() {

	Aimeos.Menu.init();
	Aimeos.Config.init();
	Aimeos.Form.init();
	Aimeos.List.init();
	Aimeos.Log.init();
	Aimeos.Msg.init();
	Aimeos.Nav.init();
	Aimeos.Tabs.init();

	flatpickr.localize(flatpickr.l10ns[$('.aimeos').attr('lang') || 'en']);
	Vue.component('flat-pickr', VueFlatpickr);
	Vue.component('v-select', VueSelect.VueSelect);

	$('.vue-block').each(function() {
		var key = $(this).data('key');

		Aimeos.components[key] = new Vue({
			el: this,
			data: function() {
				return {
					data: null
				}
			},
			beforeMount: function() {
				if(this.$el.dataset && this.$el.dataset.data) {
					this.data = JSON.parse(this.$el.dataset.data);
				}
			},
			methods: {
				add: function(data) {
					this.$refs[key].add(data);
				},
				remove: function(idx) {
					this.$refs[key].remove(idx);
				}
			}
		});
	});
});


/**
 * Load JSON admin resource definition immediately
 */
Aimeos.options = $.ajax($(".aimeos").data("url"), {
	"method": "OPTIONS",
	"dataType": "json"
});


/**
 * Initial menu state
 */
(function() {
	let active;
	if(active = document.querySelector(".aimeos .main-sidebar .sidebar-menu li.active") ) {
		if(active.previousElementSibling) {
			active.previousElementSibling.classList.add("before");
		}
		if(active.nextElementSibling) {
			active.nextElementSibling.classList.add("after");
		}
	}
})();
