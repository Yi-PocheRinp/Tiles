describe("A site", function() {
	var server;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	describe("object", function() {
		describe("should be created", function() {
			it("given a color", function() {
				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, [1, 4, 9, 255], function(s) {
						site = s;
					});
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 500);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 1,
							green: 4,
							blue: 9,
							alpha: 255
						}
					});
				});
			});

			it("with a bad URL", function() {
				var site = null;
				var url = "/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, null, function(s) {
						site = s;
					});

					server.respond();
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 5000);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 0,
							green: 0,
							blue: 0,
							alpha: 255
						}
					});
				});
			});

			it("with a good URL", function() {
				server.restore();

				var site = null;
				var url = "http://www.antarcticapps.com/";
				var abbreviation = "Aa";

				runs(function() {
					createSite(url, abbreviation, null, function(s) {
						site = s;
					});
				});

				waitsFor(function() {
					return site != null;
				}, "the site to be created", 5000);

				runs(function() {
					expect(site).toEqual({
						url: url,
						abbreviation: abbreviation,
						color: {
							red: 181,
							green: 209,
							blue: 226,
							alpha: 255
						}
					});
				});
			});
		});

		describe("should be able to be assigned a color", function() {
			var site;

			beforeEach(function() {
				site = {};
			});

			it("given a non-null color", function() {
				setSiteColor(site, [0, 1, 4, 9]);

				expect(site.color).toEqual({
					red: 0,
					green: 1,
					blue: 4,
					alpha: 9
				});
			});

			it("given a null color", function() {
				setSiteColor(site, null);

				expect(site.color).toEqual({
					red: 0,
					green: 0,
					blue: 0,
					alpha: 255
				});
			});
		});
	});

	describe("in storage", function() {
		var site;

		beforeEach(function() {
			site = null;
		});

		describe("when removed", function() {
			var sites;
			var removedSite;

			beforeEach(function() {
				site = null;

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							addSites([site], function() {
								callback();
							});
						});
					}, function() {
						removeSites([1], function() {
							getAllSites(function(s) {
								storage.get("s1", function(items) {
									removedSite = items.s1;
								});

								sites = s;
							});
						});
					});
				});
				
				waitsFor(function() {
					return sites != null;
				}, "the sites to be returned", 1000);
			});

			it("should not exist in storage", function() {
				runs(function() {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: "/",
						abbreviation: "" + 0,
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
					expect(sites[1]).toBeUndefined();
					expect(removedSite).toBeUndefined();
				});
			});

			it("should not be in the ids list", function() {
				var ids = null;

				runs(function() {
					getSortedSiteIDs(function(i) {
						ids = i;
					});
				});

				waitsFor(function() {
					return ids != null;
				}, "the ids to be gotten", 500);

				runs(function() {
					expect(ids).toEqual([]);
				});
			});
		});

		it("should be able to change its abbreviation", function() {
			runs(function() {
				createSite("/", "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteAbbreviation(created.id, "Re", function() {
							getSite(created.id, function(s) {
								site = s;
							});
						});
					});
				});
			});
			
			waitsFor(function() {
				return site != null;
			}, "the site to be returned", 500);

			runs(function() {
				expect(site).toEqual({
					url: "/",
					abbreviation: "Re",
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 0
				});
			});
		});

		it("should be able to change its color", function() {
			runs(function() {
				createSite("/", "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteColor(created.id, [0, 0, 0], function() {
							getSite(created.id, function(s) {
								site = s;
							});
						});
					});
				});
			});
			
			waitsFor(function() {
				return site != null;
			}, "the site to be returned", 500);

			runs(function() {
				expect(site).toEqual({
					url: "/",
					abbreviation: "Ab",
					color: {
						red: 0,
						green: 0,
						blue: 0,
						alpha: 255
					},
					id: 0
				});
			});
		});

		it("should be able to change its custom color", function() {
			runs(function() {
				createSite("/", "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						updateSiteCustomColor(created.id, [0, 0, 0], function() {
							getSite(created.id, function(s) {
								site = s;
							});
						});
					});
				});

				server.respond();
			});
			
			waitsFor(function() {
				return site != null;
			}, "the site to be returned", 500);

			runs(function() {
				expect(site).toEqual({
					url: "/",
					abbreviation: "Ab",
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					customColor: {
						red: 0,
						green: 0,
						blue: 0,
						alpha: 255
					},
					id: 0
				});
			});
		});

		it("should be accessible by its URL", function() {
			runs(function() {
				createSite("/", "Ab", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						getSiteForURL("/", function(s) {
							site = s;
						});
					});
				});
			});
			
			waitsFor(function() {
				return site != null;
			}, "the site to be returned", 500);

			runs(function() {
				expect(site).toEqual({
					url: "/",
					abbreviation: "Ab",
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 0
				});
			});
		});

		it("abbreviation should be accessible by its URL", function() {
			var abbreviation = null;

			runs(function() {
				createSite("/", "Te", [255, 255, 255, 255], function(created) {
					addSites([created], function() {
						getSiteAbbreviationForURL("/", function(abbrev) {
							abbreviation = abbrev;
						});
					});
				});

				server.respond();
			});
			
			waitsFor(function() {
				return abbreviation != null;
			}, "the abbreviation to be returned", 500);

			runs(function() {
				expect(abbreviation).toMatch("Te");
			});
		});
	});
});

describe("Site storage", function() {
	var server = null;

	beforeEach(function() {
		server = sinon.fakeServer.create();
	});

	afterEach(function() {
		server.restore();
	});

	describe("when requesting a next ID", function() {
		it("should default to zero", function() {
			var id = null;

			runs(function() {
				getNextID(function(i) {
					id = i;
				});
			});
			
			waitsFor(function() {
				return id != null;
			}, "the ID to be set", 500);

			runs(function() {
				expect(id).toBe(0);
			});
		});

		it("should increment after adding a site", function() {
			var id = null;

			runs(function() {
				createSite("/", "Ab", [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						getNextID(function(i) {
							id = i;
						});
					});
				});
			});
			
			waitsFor(function() {
				return id != null;
			}, "the ID to be set", 500);

			runs(function() {
				expect(id).toBe(1);
			});
		});

		it("should increase by the amount of sites added", function() {
			var id = null;

			runs(function() {
				var sites = [];

				async_loop(0, 2, function(iteration, callback) {
					createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
						sites.push(site);
						callback();
					});
				}, function() {
					addSites(sites, function() {
						getNextID(function(i) {
							id = i;
						});
					});
				});
			});
			
			waitsFor(function() {
				return id != null;
			}, "the ID to be set", 500);

			runs(function() {
				expect(id).toBe(2);
			});
		});
	});

	describe("when storing a new site", function() {
		var id, site;

		describe("using add sites", function() {
			var done;

			beforeEach(function() {
				done = false;

				runs(function() {
					createSite("/", "Ab", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							done = true;
						});
					});
				});

				waitsFor(function() {
					return done;
				}, "the site to finish saving", 500);
			});

			it("should exist in storage", function() {
				var sites = null;
				
				runs(function() {
					getAllSites(function(s) {
						sites = s;
					});
				});

				waitsFor(function() {
					return sites != null;
				}, "the sites to be returned", 500);

				runs(function() {
					expect(sites.length).toBe(1);
					expect(sites[0]).toEqual({
						url: "/",
						abbreviation: "Ab",
						color: {
							red: 255,
							green: 255,
							blue: 255,
							alpha: 255
						},
						id: 0
					});
				});
			});

			it("should cause an update to sites count", function() {
				var sitesCount = null;

				runs(function() {
					getSitesCount(function(s) {
						sitesCount = s;
					});
				});

				waitsFor(function() {
					return sitesCount != null;
				}, "the sites count to be accessed", 500);

				runs(function() {
					expect(sitesCount).toBe(1);
				});
			});
		});
	});

	describe("the sorted site IDs", function() {
		it("should default to a blank array", function() {
			var ids = null;

			runs(function() {
				getSortedSiteIDs(function(i) {
					ids = i;
				});
			})

			waitsFor(function() {
				return ids != null;
			}, "the sorted site IDs to be set", 500);

			runs(function() {
				expect(ids).toEqual([]);
			});
		});

		describe("when a site is added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function() {
					createSite("/", "1", [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							getSortedSiteIDs(function(i) {
								ids = i;
							});
						});
					});
				})

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);

				runs(function() {
					expect(ids).toEqual([0]);
				});
			});
		});

		describe("when multiple sites are added", function() {
			it("should not be empty", function() {
				var ids = null;

				runs(function() {
					var sites = [];

					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							sites.push(site);
							callback();
						});
					}, function() {
						addSites(sites, function() {
							getSortedSiteIDs(function(i) {
								ids = i;
							});
						});
					});
				});

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);

				runs(function() {
					expect(ids).toEqual([0,1]);
				});
			});
		});

		describe("when sites are reordered", function() {
			var sites;
			var ids;

			beforeEach(function() {
				sites = [];
				ids = null;

				runs(function() {
					loop(0, 2, function(iteration, callback) {
						createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
							sites.push(site);
							callback();
						});
					}, function() {
						addSites(sites, function() {
							reorderSite(1, 0, function() {
								getSortedSiteIDs(function(i) {
									ids = i;
								});
							});
						});
					});
				});

				waitsFor(function() {
					return ids != null;
				}, "the sorted site IDs to be set", 500);
			});

			it("should not be empty", function() {
				runs(function() {
					expect(ids.length).toBe(2);
				});
			});

			it("should have the sites in the right order", function() {
				runs(function() {
					expect(ids[0]).toBe(1);
					expect(ids[1]).toBe(0);
				});
			});
		});
	});

	describe("when multiple sites are saved", function() {
		var sites;

		beforeEach(function() {
			sites = null;

			runs(function() {
				loop(0, 2, function(iteration, callback) {
					createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							callback();
						});
					});
				}, function() {
					getAllSites(function(s) {
						sites = s;
					});
				});
			});
			
			waitsFor(function() {
				return sites != null;
			}, "the sites to be saved and retrieved", 500);
		});

		it("should contain the correct number of sites", function() {
			runs(function() {
				expect(sites.length).toBe(2);
			});
		});

		it("should contain the right sites", function() {
			runs(function() {
				expect(sites[0]).toEqual({
					url: "/",
					abbreviation: "" + 0,
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 0
				});
				expect(sites[1]).toEqual({
					url: "/",
					abbreviation: "" + 1,
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 1
				});
			});
		});
	});

	describe("when multiple sites are removed", function() {
		var sites;

		beforeEach(function() {
			sites = null;

			runs(function() {
				loop(0, 3, function(iteration, callback) {
					createSite("/", "" + iteration, [255, 255, 255, 255], function(site) {
						addSites([site], function() {
							callback();
						});
					});
				}, function() {
					removeSites([0, 2], function() {
						getAllSites(function(s) {
							sites = s;
						});
					});
				});
			});
			
			waitsFor(function() {
				return sites != null;
			}, "the sites to be removed and retrieved", 500);
		});

		it("should contain the correct number of sites", function() {
			runs(function() {
				expect(sites.length).toBe(1);
			});
		});

		it("should contain the right sites", function() {
			runs(function() {
				expect(sites[0]).toEqual({
					url: "/",
					abbreviation: "" + 1,
					color: {
						red: 255,
						green: 255,
						blue: 255,
						alpha: 255
					},
					id: 1
				});
				expect(sites[1]).toBeUndefined();
				expect(sites[2]).toBeUndefined();
			});
		});
	});

	describe("when updating the favicon colors", function() {
		it("should update all the sites colors", function() {
			var success = null;
			var sites = null;

			server.restore();

			runs(function() {
				createSite("http://antarcticapps.com/", "Aa", [255, 255, 255, 255], function(site) {
					addSites([site], function() {
						updateFaviconColorForAllSites(function(s) {
							success = s;
						});
					});
				});
			});
			
			waitsFor(function() {
				return success != null;
			}, "the update favicon color operation to complete", 2000);

			runs(function() {
				getAllSites(function(s) {
					sites = s;
				});
			});

			waitsFor(function() {
				return sites != null;
			}, "the sites to be gotten", 500);

			runs(function() {
				expect(success).toBe(true);
				expect(sites[0].color).toNotEqual({
					red: 255,
					green: 255,
					blue: 255,
					alpha: 255
				});	
			});
		});
	});
});